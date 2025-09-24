#ifndef CALENDAR_H
#define CALENDAR_H

#include <HTTPClient.h>
#include <ArduinoJson.h>

#include <GxEPD2_BW.h>
#include <U8g2_for_Adafruit_GFX.h>

#include <fonts/FreeMonoBold8pt7b.h>
#include <fonts/dejavusans_polish9pt.h>
#include <fonts/FreeMono9pt7b.h>
#include <Fonts/FreeMonoBold9pt7b.h>
#include <Fonts/FreeMonoBold12pt7b.h>
#include <Fonts/FreeMono12pt7b.h>
#include <Fonts/FreeMonoBold18pt7b.h>

#include "config.h"
#include <vector>

extern String room_title;
extern String room_subtitle;
extern String room_description;
extern String notification;

extern String roomLinkLabel;
extern String roomLink;
extern String lastSyncTime;

extern String day_names[3];
extern String day_nums[3];
extern String templateType; // 1 - 1 column; 2 - 2 column; 3 - 3 column

struct ClassInfo {
  String start_time;
  String end_time;
  String name_pl;
  String name_en;
  String cancelled;
};

extern std::vector<ClassInfo> current_day_classes;
extern std::vector<ClassInfo> prev_day_classes;
extern std::vector<ClassInfo> next_day_classes;

void initDisplay(bool initial);
void refreshDisplay();
void hibernateDisplay();
void drawCalendar();
void drawDayHeaders();
void drawGrid();
void drawSidebar();
void drawClasses();
void drawClass(const std::vector<ClassInfo>& classList, int dayIndex);
void drawWrappedText(String text, int16_t x, int16_t y, int16_t wrapWidth);
void drawQRCode();
void drawLayout();
void fetchQRCode();
void printNotification();
void printRoomDescription();
void updateSidebar();

#endif