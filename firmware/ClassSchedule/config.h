#ifndef CONFIG_H
#define CONFIG_H

#if __has_include("secrets.h")
#include "secrets.h"
#endif

// Wifi
#define WIFI_CONNECTION_TIMEOUT 60000 // 1 minute

// Calendar
#define COL_WIDTH 174
#define COL_HOUR_WIDTH 28
#define ROW_HEIGHT 30
#define PADDING_X 8
#define PADDING_Y 16
#define START_H 8
#define END_H 20

// Display ports
#define EPD_BUSY D5
#define EPD_RST D0
#define EPD_DC D3
#define EPD_CS D1


#endif