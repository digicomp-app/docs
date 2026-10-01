---
title: OLED Tetris Game
---

# OLED Tetris Game

## Project Overview

This project implements a full-featured **Tetris game** running on an **ESP32-S3** microcontroller using a **128x32 SSD1306 OLED display** and an **HW-040 Rotary Encoder**.

The game includes state-management menus, real-time telemetry rendering, non-volatile high-score tracking via ESP32 `Preferences`, interrupt-driven encoder controls, and game logic optimized for compact monochromatic screens.

## Hardware Components

- **ESP32-S3 Dev Board**
- **0.91" SSD1306 I2C OLED Display** (128 x 32 pixels)
- **HW-040 Rotary Encoder Module** (with push button)
- Breadboard & Jumper Wires
- USB-C Cable

## Pin Connections

| Pin Label | ESP32-S3 Pin  |
| --------- | ------------- |
| VCC       | **3.3V / 5V** |
| GND       | **GND**       |
| SDA       | **GPIO 8**    |
| SCL       | **GPIO 9**    |

| Pin Label | ESP32-S3 Pin |
| --------- | ------------ |
| CLK       | **GPIO 1**   |
| DT        | **GPIO 2**   |
| SW        | **GPIO 4**   |
| +         | **3.3V**     |
| GND       | **GND**      |

## Software & Library Setup

- **IDE:** Arduino IDE
- **Board Package:** ESP32 Board Manager by Espressif Systems (`ESP32S3 Dev Module`)
- **Required Arduino Libraries:**
  - `Adafruit_GFX`
  - `Adafruit_SSD1306`
  - `Wire` (Built-in)
  - `Preferences` (Built-in ESP32 Non-Volatile Storage)

## Complete Arduino Code (`main.ino`)

```cpp
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Preferences.h>

// Screen Configuration
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 32
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

Preferences preferences;

// HW-040 Rotary Encoder Pins (Interrupt Compatible)
#define ENCODER_CLK  1
#define ENCODER_DT   2
#define ENCODER_SW   4

// --- Game Settings ---
#define GRID_W 10
#define GRID_H 10
#define CELL_SIZE 3
#define GRID_OFFSET_X 1
#define GRID_OFFSET_Y 1

uint8_t grid[GRID_W][GRID_H] = {0};

// Game Timing
unsigned long lastFallTime = 0;
const unsigned long baseFallInterval = 500;
const unsigned long minimumFallInterval = 100;
unsigned long currentFallInterval = baseFallInterval;

// Button Debounce & Timing
unsigned long btnPressTime = 0;
bool btnLastState = HIGH;

// ISR Variables
volatile int encoderDelta = 0;
volatile uint8_t lastClkState = HIGH;

// Tetromino Definitions (4x4 matrices)
const uint8_t TETROMINOS[7][4][4] = {
  // I
  {{0,0,0,0},{1,1,1,1},{0,0,0,0},{0,0,0,0}},
  // J
  {{1,0,0,0},{1,1,1,0},{0,0,0,0},{0,0,0,0}},
  // L
  {{0,0,1,0},{1,1,1,0},{0,0,0,0},{0,0,0,0}},
  // O
  {{0,1,1,0},{0,1,1,0},{0,0,0,0},{0,0,0,0}},
  // S
  {{0,1,1,0},{1,1,0,0},{0,0,0,0},{0,0,0,0}},
  // T
  {{0,1,0,0},{1,1,1,0},{0,0,0,0},{0,0,0,0}},
  // Z
  {{1,1,0,0},{0,1,1,0},{0,0,0,0},{0,0,0,0}}
};

enum GameState {
  STATE_LOADING,
  STATE_MENU,
  STATE_PLAYING,
  STATE_GAMEOVER,
  STATE_HIGHSCORE
};

GameState currentState = STATE_LOADING;

// Game State Variables
int score = 0;
int highScore = 0;
int menuSelection = 0;
int linesCleared = 0;
int currentPiece[4][4];
int pieceX, pieceY, pieceType;

// --- ISR handles rotation efficiently ---
void IRAM_ATTR handleEncoderISR() {
  uint8_t clkState = digitalRead(ENCODER_CLK);
  if (clkState != lastClkState && clkState == LOW) {
    if (digitalRead(ENCODER_DT) != clkState) {
      encoderDelta++; // Clockwise
    } else {
      encoderDelta--; // Counter-Clockwise
    }
  }
  lastClkState = clkState;
}

// Function Prototypes
void showLoadingScreen();
void showMenu();
void drawGame();
void spawnPiece();
bool checkCollision(int px, int py, int piece[4][4]);
void rotatePiece();
void mergePiece();
void clearLines();
void gameOver();
void handleInputs();

void setup() {
  Serial.begin(115200);

  pinMode(ENCODER_CLK, INPUT_PULLUP);
  pinMode(ENCODER_DT, INPUT_PULLUP);
  pinMode(ENCODER_SW, INPUT_PULLUP);

  attachInterrupt(digitalPinToInterrupt(ENCODER_CLK), handleEncoderISR, CHANGE);

  Wire.begin(8, 9);

  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
    for (;;);
  }

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Load Highscore from NVS
  preferences.begin("tetris_s3", false);
  highScore = preferences.getInt("highscore", 0);

  showLoadingScreen();
  currentState = STATE_MENU;
}

void loop() {
  handleInputs();

  switch (currentState) {
    case STATE_MENU:
      showMenu();
      break;

    case STATE_PLAYING:
      if (millis() - lastFallTime > currentFallInterval) {
        if (!checkCollision(pieceX, pieceY + 1, currentPiece)) {
          pieceY++;
        } else {
          mergePiece();
          clearLines();
          spawnPiece();
          if (checkCollision(pieceX, pieceY, currentPiece)) {
            gameOver();
          }
        }
        lastFallTime = millis();
      }
      drawGame();
      break;

    case STATE_GAMEOVER:
      display.clearDisplay();
      display.setCursor(38, 2);
      display.print("GAME OVER");
      display.setCursor(35, 18);
      display.print("SCORE: ");
      display.print(score);
      display.display();
      break;

    case STATE_HIGHSCORE:
      display.clearDisplay();
      display.setCursor(35, 2);
      display.print("HIGH SCORE");
      display.setCursor(58, 18);
      display.print(highScore);
      display.display();
      break;
  }
  delay(10);
}

void handleInputs() {
  noInterrupts();
  int moveDir = encoderDelta;
  encoderDelta = 0;
  interrupts();

  bool btnState = digitalRead(ENCODER_SW);
  bool shortClick = false;
  bool longPress = false;

  if (btnState == LOW && btnLastState == HIGH) {
    btnPressTime = millis();
  } else if (btnState == HIGH && btnLastState == LOW) {
    unsigned long pressDuration = millis() - btnPressTime;
    if (pressDuration >= 400) {
      longPress = true;
    } else if (pressDuration > 40) {
      shortClick = true;
    }
  }
  btnLastState = btnState;

  if (currentState == STATE_MENU) {
    if (moveDir > 0) menuSelection = 1;
    if (moveDir < 0) menuSelection = 0;
    if (shortClick || longPress) {
      if (menuSelection == 0) {
        memset(grid, 0, sizeof(grid));
        score = 0;
        linesCleared = 0;
        currentFallInterval = baseFallInterval;
        spawnPiece();
        currentState = STATE_PLAYING;
      } else {
        currentState = STATE_HIGHSCORE;
      }
    }
  }
  else if (currentState == STATE_PLAYING) {
    if (moveDir > 0) {
      if (!checkCollision(pieceX + 1, pieceY, currentPiece)) pieceX++;
    } else if (moveDir < 0) {
      if (!checkCollision(pieceX - 1, pieceY, currentPiece)) pieceX--;
    }

    if (shortClick) {
      rotatePiece();
    }
    else if (longPress) {
      while (!checkCollision(pieceX, pieceY + 1, currentPiece)) {
        pieceY++;
      }
    }
  }
  else if (currentState == STATE_GAMEOVER || currentState == STATE_HIGHSCORE) {
    if (shortClick || longPress || moveDir != 0) {
      currentState = STATE_MENU;
    }
  }
}

void showLoadingScreen() {
  unsigned long start = millis();
  while (millis() - start < 2000) {
    display.clearDisplay();
    display.setTextSize(2);
    display.setCursor(28, 2);
    display.print("TETRIS");

    int progress = map(millis() - start, 0, 2000, 0, 110);
    display.drawRect(8, 22, 114, 8, SSD1306_WHITE);
    display.fillRect(10, 24, progress, 4, SSD1306_WHITE);

    display.display();
    delay(15);
  }
  display.setTextSize(1);
}

void showMenu() {
  display.clearDisplay();
  display.setCursor(35, 2);
  display.print("MAIN MENU");

  if (menuSelection == 0) {
    display.fillRect(8, 16, 52, 14, SSD1306_WHITE);
    display.setTextColor(SSD1306_BLACK, SSD1306_WHITE);
    display.setCursor(14, 19);
    display.print("START");

    display.setTextColor(SSD1306_WHITE);
    display.setCursor(68, 19);
    display.print("HIGH SCORE");
  } else {
    display.setCursor(14, 19);
    display.print("START");

    display.fillRect(64, 16, 58, 14, SSD1306_WHITE);
    display.setTextColor(SSD1306_BLACK, SSD1306_WHITE);
    display.setCursor(68, 19);
    display.print("HIGH SCORE");
    display.setTextColor(SSD1306_WHITE);
  }

  display.display();
}

void spawnPiece() {
  pieceType = random(0, 7);
  for (int r = 0; r < 4; r++) {
    for (int c = 0; c < 4; c++) {
      currentPiece[r][c] = TETROMINOS[pieceType][r][c];
    }
  }
  pieceX = GRID_W / 2 - 2;
  pieceY = 0;
}

bool checkCollision(int px, int py, int piece[4][4]) {
  for (int r = 0; r < 4; r++) {
    for (int c = 0; c < 4; c++) {
      if (piece[r][c]) {
        int gx = px + c;
        int gy = py + r;

        if (gx < 0 || gx >= GRID_W || gy >= GRID_H) return true;
        if (gy >= 0 && grid[gx][gy]) return true;
      }
    }
  }
  return false;
}

void rotatePiece() {
  int temp[4][4];
  for (int r = 0; r < 4; r++) {
    for (int c = 0; c < 4; c++) {
      temp[c][3 - r] = currentPiece[r][c];
    }
  }
  if (!checkCollision(pieceX, pieceY, temp)) {
    for (int r = 0; r < 4; r++) {
      for (int c = 0; c < 4; c++) {
        currentPiece[r][c] = temp[r][c];
      }
    }
  }
}

void mergePiece() {
  for (int r = 0; r < 4; r++) {
    for (int c = 0; c < 4; c++) {
      if (currentPiece[r][c]) {
        if (pieceY + r >= 0) {
          grid[pieceX + c][pieceY + r] = 1;
        }
      }
    }
  }
}

void clearLines() {
  int linesFound = 0;
  for (int y = GRID_H - 1; y >= 0; y--) {
    bool full = true;
    for (int x = 0; x < GRID_W; x++) {
      if (!grid[x][y]) {
        full = false;
        break;
      }
    }
    if (full) {
      linesFound++;
      for (int moveY = y; moveY > 0; moveY--) {
        for (int x = 0; x < GRID_W; x++) {
          grid[x][moveY] = grid[x][moveY - 1];
        }
      }
      for (int x = 0; x < GRID_W; x++) grid[x][0] = 0;
      y++;
    }
  }

  if (linesFound > 0) {
    score += (10 * linesFound) * linesFound;
    linesCleared += linesFound;

    int level = linesCleared / 5;
    currentFallInterval = baseFallInterval - (level * 50);
    if (currentFallInterval < minimumFallInterval) currentFallInterval = minimumFallInterval;
  }
}

void gameOver() {
  if (score > highScore) {
    highScore = score;
    preferences.putInt("highscore", highScore);
  }
  currentState = STATE_GAMEOVER;
}

void drawGame() {
  display.clearDisplay();

  // Draw Grid Border
  display.drawRect(GRID_OFFSET_X - 1, GRID_OFFSET_Y - 1, (GRID_W * CELL_SIZE) + 2, (GRID_H * CELL_SIZE) + 2, SSD1306_WHITE);

  // Placed Blocks: Solid Rectangles
  for (int x = 0; x < GRID_W; x++) {
    for (int y = 0; y < GRID_H; y++) {
      if (grid[x][y]) {
        display.fillRect(GRID_OFFSET_X + (x * CELL_SIZE), GRID_OFFSET_Y + (y * CELL_SIZE), CELL_SIZE, CELL_SIZE, SSD1306_WHITE);
      }
    }
  }

  // Active Falling Block: Hollow Outline
  for (int r = 0; r < 4; r++) {
    for (int c = 0; c < 4; c++) {
      if (currentPiece[r][c]) {
        int drawX = GRID_OFFSET_X + ((pieceX + c) * CELL_SIZE);
        int drawY = GRID_OFFSET_Y + ((pieceY + r) * CELL_SIZE);
        if (drawY >= GRID_OFFSET_Y) {
          display.drawRect(drawX, drawY, CELL_SIZE, CELL_SIZE, SSD1306_WHITE);
        }
      }
    }
  }

  // Telemetry Dashboard
  display.setCursor(38, 2);
  display.print("SCR:");
  display.print(score);

  display.setCursor(38, 13);
  display.print("BST:");
  display.print(highScore);

  display.drawLine(36, 23, 128, 23, SSD1306_WHITE);
  display.setCursor(38, 24);
  display.print("ROT=KNOB PRESS");

  display.display();
}
```

## Conclusion

This project successfully integrates low-level interrupt handling, persistent flash storage, and interactive game logic into an ultra-compact **Digicomp ESP32-S3** and **SSD1306 hardware setup**.
