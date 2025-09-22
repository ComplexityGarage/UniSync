#include "calendar.h"
#include <QRCodeGFX.h>

String room_title;
String room_subtitle;
String room_description;
String notification;
String templateType;

String roomLinkLabel;
String roomLink;

String day_names[3];
String day_nums[3];
int qrWidth = 0;
int qrHeight = 0;
int columns = 0;
int colWidth = 0;
bool qrReady = false;
std::vector<int> days_indexes;

std::vector<ClassInfo> current_day_classes;
std::vector<ClassInfo> prev_day_classes;
std::vector<ClassInfo> next_day_classes;
std::vector<uint8_t> bitmap;

GxEPD2_4G_BW<GxEPD2_750_T7, GxEPD2_750_T7::HEIGHT> display(GxEPD2_750_T7(EPD_CS, EPD_DC, EPD_RST, EPD_BUSY));

U8G2_FOR_ADAFRUIT_GFX u8g2Fonts;

QRCodeGFX qrcode(display);

void initDisplay() {
  display.init(115200, true, 2, false);
  display.setFullWindow();

  u8g2Fonts.begin(display);
  u8g2Fonts.setFont(u8g2_font_unifont_t_polish);
}

void refreshDisplay() {
  display.clearScreen();
  display.refresh(false);
}

void drawCalendar() {
  days_indexes.clear();

  if (templateType == "1") {
    columns = 1;
    colWidth = COL_WIDTH * 3;
    days_indexes.push_back(1);
  } else if (templateType == "2") {
    columns = 2;
    colWidth = COL_WIDTH + COL_WIDTH * 0.5;
    days_indexes.push_back(1);
    days_indexes.push_back(2);
  } else {
    columns = 3;
    colWidth = COL_WIDTH;
    days_indexes.push_back(0);
    days_indexes.push_back(1);
    days_indexes.push_back(2);
  }

  display.firstPage();
  do {
    display.fillScreen(GxEPD_WHITE);

    drawLayout();
    drawDayHeaders();
    drawGrid();
    drawClasses();
    drawSidebar();
  } while (display.nextPage());
}

void drawLayout() {
  display.drawLine(PADDING_X + COL_HOUR_WIDTH, 0, PADDING_X + COL_HOUR_WIDTH, display.height(), GxEPD_BLACK);

  for (int i = 1; i <= columns - 1; i++) {
    int x = i * colWidth + PADDING_X + COL_HOUR_WIDTH;
    display.drawLine(x, 0, x, display.height(), GxEPD_BLACK);
  };
  display.fillRect(colWidth * columns + COL_HOUR_WIDTH + PADDING_X * 2, 0, 2, display.height(), GxEPD_BLACK);
}

void drawDayHeaders() {
  for (int i = 0; i < days_indexes.size(); i++) {
    int x = i * colWidth + colWidth / 2 + COL_HOUR_WIDTH + PADDING_X;
    int16_t x1, y1;
    uint16_t w1, h1;

    int textWidth = u8g2Fonts.getUTF8Width(day_names[days_indexes[i]].c_str());
    u8g2Fonts.setForegroundColor(GxEPD_BLACK);
    u8g2Fonts.setBackgroundColor(GxEPD_WHITE);
    u8g2Fonts.setCursor(x - textWidth / 2, PADDING_Y);
    u8g2Fonts.print(day_names[days_indexes[i]]);

    display.setFont(&FreeMonoBold12pt7b);
    display.setTextColor(GxEPD_BLACK);
    display.setCursor(x - 14, PADDING_Y + 40);
    if (days_indexes[i] == 1) {
      display.fillCircle(x, PADDING_Y + 34, 20, GxEPD_RED);
      display.setTextColor(GxEPD_WHITE);
    }
    display.print(day_nums[days_indexes[i]]);
  }
}

void drawGrid() {
  for (int i = START_H; i <= END_H; i++) {
    int y = (i - START_H) * ROW_HEIGHT + PADDING_Y + 70 + 5;  // 70 - header's height, 5 - margin-top
    int x = PADDING_X;

    display.drawLine(x, y, 558, y, GxEPD_BLACK);
    display.setFont(&FreeMono9pt7b);
    display.setCursor(x, y + 20);
    display.print(i);
  }
}

void drawSidebar() {
  display.setFont(&FreeMonoBold18pt7b);
  display.setTextColor(GxEPD_BLACK);
  display.setCursor(562 + PADDING_X * 2, PADDING_Y + 10);  // 562 - calendar grid right border
  display.print("Sala");
  display.setCursor(562 + PADDING_X * 2, PADDING_Y + 40);
  display.print(room_title);

  if (notification.isEmpty()) {
    printRoomDescription();
  } else {
    printNotification();
  };

  drawQRCode();
}

void printNotification() {
  display.fillRoundRect(562 + PADDING_X * 2, PADDING_Y + 60, 180, 230, 6, GxEPD_LIGHTGREY);
  display.setTextColor(GxEPD_WHITE);
  display.setFont(&FreeMonoBold9pt7b);
  display.setCursor(562 + PADDING_X * 2 + 10, PADDING_Y + 80);
  display.print("UWAGA!");

  u8g2Fonts.setForegroundColor(GxEPD_WHITE);
  u8g2Fonts.setBackgroundColor(GxEPD_LIGHTGREY);
  drawWrappedText(notification, 562 + PADDING_X * 2 + 10, PADDING_Y + 100, 160);
}

void printRoomDescription() {
  u8g2Fonts.setForegroundColor(GxEPD_BLACK);
  u8g2Fonts.setBackgroundColor(GxEPD_WHITE);
  drawWrappedText(room_subtitle, 562 + PADDING_X * 2, PADDING_Y + 80, 160);
  drawWrappedText(room_description, 562 + PADDING_X * 2, PADDING_Y + 125, 160);
}


void updateSidebar() {
  display.setPartialWindow(562 + PADDING_X * 2, 0, 800 - (562 + PADDING_X * 2), display.height());

  display.firstPage();
  do {
    display.fillScreen(GxEPD_WHITE);
    drawSidebar();
  } while (display.nextPage());
}

void drawClasses() {
  if (columns == 2) {
    drawClass(current_day_classes, 0);
    drawClass(next_day_classes, 1);
  };

  if (columns == 1) {
    drawClass(current_day_classes, 0);
  }

  if (columns == 3) {
    drawClass(prev_day_classes, 0);
    drawClass(current_day_classes, 1);
    drawClass(next_day_classes, 2);
  };
}

void drawClass(const std::vector<ClassInfo>& classList, int dayIndex) {
  for (const ClassInfo& cls : classList) {
    int start_h = cls.start_time.substring(11, 13).toInt();
    int start_m = cls.start_time.substring(14, 16).toInt();
    int end_h = cls.end_time.substring(11, 13).toInt();
    int end_m = cls.end_time.substring(14, 16).toInt();
    int duration = end_h * 60 + end_m - start_h * 60 - start_m;

    int y = (start_h - START_H) * ROW_HEIGHT + PADDING_Y + 70 + 8 + (ROW_HEIGHT * start_m) / 60;
    int x = colWidth * dayIndex + COL_HOUR_WIDTH + PADDING_X + 5;
    int h = (duration * ROW_HEIGHT) / 60 - 4;

    display.fillRoundRect(x, y, colWidth - 10, h, 6, GxEPD_BLACK);

    if (cls.cancelled == "true") {
      display.fillRoundRect(colWidth * dayIndex + colWidth - 40, y + 4, 60, 16, 30, GxEPD_RED);
      u8g2Fonts.setFont(u8g2_font_6x10_tf);
      u8g2Fonts.setForegroundColor(GxEPD_WHITE);
      u8g2Fonts.setBackgroundColor(GxEPD_RED);
      u8g2Fonts.setCursor(colWidth * dayIndex + colWidth - 34, y + 15);
      u8g2Fonts.print("Odwolane");
    }

    // display.fillRoundRect(x, y, colWidth - 10, h, 6, GxEPD_BLACK);
    // display.fillRoundRect(x + 1, y + 1, colWidth - 12, h - 2, 4, GxEPD_WHITE);

    String timeStr = String(start_h) + ":" + (start_m < 10 ? "0" : "") + String(start_m);
    timeStr += " - ";
    timeStr += String(end_h) + ":" + (end_m < 10 ? "0" : "") + String(end_m);

    u8g2Fonts.setFont(u8g2_font_7x13_tf);
    u8g2Fonts.setForegroundColor(GxEPD_WHITE);
    u8g2Fonts.setBackgroundColor(GxEPD_BLACK);
    u8g2Fonts.setCursor(x + 4, y + 15);
    u8g2Fonts.print(timeStr);

    u8g2Fonts.setFont(u8g2_font_unifont_t_polish);
    u8g2Fonts.setCursor(x + 4, y + 31);  // start writing at this position
    u8g2Fonts.print(cls.name_pl);
  }
}

void drawWrappedText(String text, int16_t x, int16_t y, int16_t wrapWidth) {
  int16_t cursorX = x;
  int16_t cursorY = y;

  String word = "";
  String line = "";

  for (int i = 0; i <= text.length(); i++) {
    char c = text[i];

    if (c == ' ' || c == '\n' || c == '\0') {
      String testLine = line + word;
      int width = u8g2Fonts.getUTF8Width(testLine.c_str());
      int height = 1 + u8g2Fonts.getFontAscent() - u8g2Fonts.getFontDescent();

      if (width > wrapWidth) {
        u8g2Fonts.setCursor(cursorX, cursorY);
        u8g2Fonts.print(line);
        cursorY += height + 2;

        line = word;
      } else {
        line += word;
      }

      word = "";
      if (c == ' ') {
        if (line.length() > 0) {
          line += " ";
        }
      }

      if (c == '\n') {
        u8g2Fonts.setCursor(cursorX, cursorY);
        u8g2Fonts.print(line);
        cursorY += height;
        line = "";
      }

    } else {
      word += c;
    }
  }

  if (line.length() > 0) {
    u8g2Fonts.setCursor(cursorX, cursorY);
    u8g2Fonts.print(line);
  }
}

void drawQRCode() {
  if (roomLink == "") return;

  display.setFont(&FreeMonoBold9pt7b);
  display.setCursor(562 + PADDING_X * 2, 340);
  display.setTextColor(GxEPD_BLACK);
  display.print(roomLinkLabel);

  qrcode.setScale(4);
  qrcode.draw(roomLink, 562 + PADDING_X * 2, 350);
}
