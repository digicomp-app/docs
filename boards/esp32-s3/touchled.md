---
title: Touch-Controlled RGB LED
---

# Touch-Controlled RGB LED System

## Project Overview

This project uses an **Digicomp ESP32-S3 Dev Board** to control an **RGB LED** using a built-in **capacitive touch sensor**.

Tapping the touch sensor cycles through 6 distinct color modes using PWM (Pulse Width Modulation):

1. **Red**
2. **Green**
3. **Blue**
4. **Yellow**
5. **White**
6. **Off**

## Hardware Components

- **Digicomp ESP32-S3** Dev Board
- Common Cathode RGB LED
- Capacitive Touch Pad or Jumper Wire (Touch Pin)
- Breadboard & Jumper Wires
- USB-C Cable

## Pin Connections

| Component               | Pin Label   | ESP32-S3 Pin |
| ----------------------- | ----------- | ------------ |
| **Touch Sensor / Wire** | Signal      | **GPIO 1**   |
| **RGB LED**             | Red Anode   | **GPIO 4**   |
| **RGB LED**             | Green Anode | **GPIO 5**   |
| **RGB LED**             | Blue Anode  | **GPIO 6**   |
| **RGB LED**             | Cathode     | **GND**      |

### Connection Summary

- **Touch Pin → ESP32-S3 GPIO 1**
- **RGB Red Pin → ESP32-S3 GPIO 4**
- **RGB Green Pin → ESP32-S3 GPIO 5**
- **RGB Blue Pin → ESP32-S3 GPIO 6**
- **RGB Cathode Pin → ESP32-S3 GND**

## Software Setup

- **IDE:** Arduino IDE
- **Board Package:** ESP32 Board Manager by Espressif Systems
- **Board Selection:** `ESP32S3 Dev Module`

## Complete Arduino Code (`main.ino`)

```cpp
// Define Pins
const int touchPin = 1; // GPIO 1 (TOUCH1)
const int redPin   = 4; // GPIO 4
const int greenPin = 5; // GPIO 5
const int bluePin  = 6; // GPIO 6

// Touch threshold: adjust if sensitivity is too high or low
const int TOUCH_THRESHOLD = 30000;

int currentMode = 0;
bool isTouched = false;

void setup() {
  Serial.begin(115200);

  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);

  // Set initial color (Off)
  updateColor();
}

void loop() {
  // Read touch value on ESP32-S3
  int touchVal = touchRead(touchPin);

  // Detect tap event (when value drops below threshold)
  if (touchVal < TOUCH_THRESHOLD && !isTouched) {
    isTouched = true;
    currentMode = (currentMode + 1) % 6; // Cycle through 6 modes (0 to 5)
    updateColor();
    delay(50); // Debounce delay
  }
  else if (touchVal >= TOUCH_THRESHOLD && isTouched) {
    isTouched = false; // Reset touch state when finger is removed
  }

  delay(20);
}

void updateColor() {
  switch (currentMode) {
    case 0: setColor(255, 0, 0);   break; // Red
    case 1: setColor(0, 255, 0);   break; // Green
    case 2: setColor(0, 0, 255);   break; // Blue
    case 3: setColor(255, 255, 0); break; // Yellow
    case 4: setColor(255, 255, 255); break; // White
    case 5: setColor(0, 0, 0);     break; // Off
  }
}

void setColor(int red, int green, int blue) {
  // For Common Cathode: PWM 0-255
  // (If using Common Anode, change to: 255 - red, etc.)
  analogWrite(redPin, red);
  analogWrite(greenPin, green);
  analogWrite(bluePin, blue);
}
```

## Conclusion

This Touch-Controlled RGB LED System demonstrates capacitive sensing and PWM output control using the **Digicomp ESP32-S3** Dev board. The state-machine logic prevents continuous cycling on long presses, delivering clean tap detection without requiring extra mechanical pushbuttons.
