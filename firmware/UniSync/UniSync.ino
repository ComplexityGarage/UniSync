#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>

#include "config.h"
#include "calendar.h"

#if WIFI_USE_STA
#include "esp_eap_client.h"
#endif

void connectWifi(int delayInterval = 1000) {
  Serial.println("WiFi connecting.");

#if WIFI_USE_STA
  WiFi.mode(WIFI_STA);

  esp_eap_client_set_identity((uint8_t *)WIFI_USERNAME, strlen(WIFI_USERNAME));
  esp_eap_client_set_username((uint8_t *)WIFI_USERNAME, strlen(WIFI_USERNAME));
  esp_eap_client_set_password((uint8_t *)WIFI_PASSWORD, strlen(WIFI_PASSWORD));
  esp_wifi_sta_enterprise_enable();

  WiFi.begin(WIFI_SSID);
#else
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
#endif

  while (WiFi.status() != WL_CONNECTED) {
    delay(delayInterval);
    Serial.print(".");
  }
}

#define uS_TO_S_FACTOR 1000000ULL
#define TIME_TO_SLEEP 60  // seconds

Preferences preferences;
String inputBuffer;
bool isFirstInit = true;
bool isFetchInProgress = false;
int syncInterval = 60;
RTC_DATA_ATTR long long lastUpdatedAt = 0;

void setup() {
  Serial.begin(115200);
  preferences.begin("config", false);
  delay(1000);
  connectWifi();

  esp_sleep_wakeup_cause_t cause = esp_sleep_get_wakeup_cause();

  if (cause == ESP_SLEEP_WAKEUP_UNDEFINED) {
    initDisplay(true);
    refreshDisplay();
    fetchCalendarData();
    drawCalendar();
  } else {
    initDisplay(false);
  }
}

void fetchCalendarData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi doesn't connect");
    return;
  }

  isFetchInProgress = true;

  Serial.println("Fetch Calendar Data");

  HTTPClient http;
  http.begin(preferences.getString("api_url"));
  int httpResponseCode = http.GET();

  if (httpResponseCode <= 0) {
    isFetchInProgress = false;
    return;
  }

  if (httpResponseCode == 200) {
    String payload = http.getString();
    parseCalendarJson(payload);
  }

  if (httpResponseCode == 404) {
    preferences.putString("api_url", "");
  }

  isFetchInProgress = false;
}

void parseCalendarJson(const String &payload) {
  JsonDocument doc;

  DeserializationError error = deserializeJson(doc, payload);

  room_title = doc["room_title"].as<String>();
  room_subtitle = doc["room_subtitle"].as<String>();
  room_description = doc["room_description"].as<String>();
  lastUpdatedAt = doc["last_updated_at"];
  notification = doc["notification"].as<String>();
  templateType = doc["template"].as<String>();
  syncInterval = doc["sync_interval"].as<int>();
  lastSyncTime = doc["current_time"].as<String>();
  roomLinkLabel = doc["room_link_label"].as<String>();
  roomLink = doc["room_link"].as<String>();

  JsonObject calendar = doc["calendar"];

  day_names[0] = calendar["prev"]["name"].as<String>();
  day_nums[0] = calendar["prev"]["day"].as<String>();
  day_names[1] = calendar["current"]["name"].as<String>();
  day_nums[1] = calendar["current"]["day"].as<String>();
  day_names[2] = calendar["next"]["name"].as<String>();
  day_nums[2] = calendar["next"]["day"].as<String>();

  prev_day_classes.clear();
  current_day_classes.clear();
  next_day_classes.clear();

  for (JsonObject cls : calendar["prev"]["classes"].as<JsonArray>()) {
    ClassInfo info;
    info.start_time = cls["start_time"].as<String>();
    info.end_time = cls["end_time"].as<String>();
    info.name_pl = cls["name"]["pl"].as<String>();
    info.name_en = cls["name"]["en"].as<String>();
    info.cancelled = cls["cancelled"].as<String>();
    prev_day_classes.push_back(info);
  }

  for (JsonObject cls : calendar["current"]["classes"].as<JsonArray>()) {
    ClassInfo info;
    info.start_time = cls["start_time"].as<String>();
    info.end_time = cls["end_time"].as<String>();
    info.name_pl = cls["name"]["pl"].as<String>();
    info.name_en = cls["name"]["en"].as<String>();
    info.cancelled = cls["cancelled"].as<String>();
    current_day_classes.push_back(info);
  }


  for (JsonObject cls : calendar["next"]["classes"].as<JsonArray>()) {
    ClassInfo info;
    info.start_time = cls["start_time"].as<String>();
    info.end_time = cls["end_time"].as<String>();
    info.name_pl = cls["name"]["pl"].as<String>();
    info.name_en = cls["name"]["en"].as<String>();
    info.cancelled = cls["cancelled"].as<String>();
    next_day_classes.push_back(info);
  }
}

void updateApiUrl(String url) {
  if (preferences.getString("api_url") == url) {
    Serial.println("[API_URL_UPDATED]");
    return;
  }

  preferences.putString("api_url", url);
  Serial.println("[API_URL_UPDATED]");

  fetchCalendarData();
  drawCalendar();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWifi(5 * 60000);
    return;
  }

  while (Serial.available()) {
    char c = Serial.read();

    if (c == '\n') {
      inputBuffer.trim();

      if (inputBuffer.startsWith("URL:")) {
        String url = inputBuffer.substring(4);
        updateApiUrl(url);
      }

      inputBuffer = "";

      delay(1000);
    } else {
      inputBuffer += c;
    }
  }

  if (preferences.getString("api_url", "") == "") {
    // Empty state
    delay(10000);
    return;
  }

  if (isFetchInProgress) {
    delay(10000);
    return;
  }
  
  long long prevLastUpdatedAt = lastUpdatedAt;

  fetchCalendarData();

  if (prevLastUpdatedAt != lastUpdatedAt) {
    Serial.println("Refresh calendar");
    drawCalendar();
  }

  if (Serial) {
    delay(4000);
  } else {
    hibernateDisplay();
    delay(2000);
    esp_sleep_enable_timer_wakeup(syncInterval * uS_TO_S_FACTOR);
    esp_deep_sleep_start();
  }
}
