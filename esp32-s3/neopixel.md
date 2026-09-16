# Touch-Controlled RGB LED Strip

## 1. Project Title

**Touch-Controlled RGB LED Strip using ESP32-S3**

---

## 2. Project Overview

This project uses an **ESP32-S3-WROOM** to control a **WS2812B addressable RGB LED strip**.

A touch/sensing input is connected to **GPIO 14**. When the sensing pin is touched, the ESP32 detects the change and switches the LED strip to the next predefined color pattern.

The project also includes a **brightness control through serial input**. A brightness value can be sent from a laptop to the ESP32, allowing the brightness of the LED strip to be changed.

---

## 3. Hardware Components

* ESP32-S3-WROOM
* WS2812B RGB LED strip
* Jumper wires
* USB cable
* Computer/Laptop
* Power supply for the LED strip

---

## 4. Pin Connections

| Component           | ESP32-S3 Pin                        |
| ------------------- | ----------------------------------- |
| WS2812B Data Input  | GPIO 4                              |
| Touch/Sensing Input | GPIO 14                             |
| GND                 | GND                                 |
| LED Strip Power     | External 5V / suitable power supply |

### Connection Summary

**GPIO 4 → WS2812B Data IN**

**GPIO 14 → Touch/Sensing input**

**ESP32 GND → LED Strip GND**

---

## 5. Software Used

* MicroPython
* VS Code
* MicroPico extension
* `neopixel` module
* `machine` module
* `uselect` module

---

## 6. How the Project Works

The project has three main parts:

### 6.1 RGB LED Control

The WS2812B LED strip is connected to **GPIO 4**.

The program creates a NeoPixel object:

```python
np = neopixel.NeoPixel(Pin(4, Pin.OUT), NUM_LEDS)
```

The project uses **30 LEDs**:

```python
NUM_LEDS = 30
```

Each LED can be individually controlled with RGB values.

For example:

```python
(255, 0, 0)
```

represents red.

```python
(0, 255, 0)
```

represents green.

```python
(0, 0, 255)
```

represents blue.

---

### 6.2 Touch/Sensing

**GPIO 14** is used as the touch/sensing input.

```python
touch = TouchPad(Pin(14))
```

When the program starts, it first measures the normal sensor value without touching the pin.

This is called the **baseline**.

The program takes 20 readings:

```python
for i in range(20):
    total += touch.read()
    time.sleep(0.05)
```

Then it calculates:

```python
baseline = total / 20
```

A threshold is calculated from the baseline:

```python
threshold = baseline * 0.30 + 5000
```

During the main loop, the current touch value is compared with the baseline:

```python
value = touch.read()
difference = abs(value - baseline)
```

If the difference becomes larger than the threshold, the program considers it a touch.

---

### 6.3 Changing the LED Pattern

When a touch is detected:

```python
if difference > threshold and not touched:
```

the program increases the pattern index:

```python
pattern_index += 1
```

If the last pattern has been reached, it returns to the first pattern:

```python
if pattern_index >= len(patterns):
    pattern_index = 0
```

Then the new pattern is displayed:

```python
show_pattern()
```

Therefore, each touch changes the LED strip to the **next color pattern**.

---

## 7. LED Patterns

The program contains three predefined patterns.

### Pattern 1

```text
Red → Green → Blue → Yellow → Magenta
```

### Pattern 2

```text
Cyan → Orange → Purple → Greenish Cyan
```

### Pattern 3

```text
White → Red → Blue
```

The colors repeat across all 30 LEDs.

For example, if a pattern contains five colors, the program uses:

```python
color = colors[i % len(colors)]
```

This allows the smaller color pattern to repeat across the entire LED strip.

---

## 8. Brightness Control

The program has a brightness variable:

```python
brightness = 255
```

The maximum brightness is **255** and the minimum is **0**.

The RGB values are adjusted according to the brightness:

```python
r = color[0] * brightness // 255
g = color[1] * brightness // 255
b = color[2] * brightness // 255
```

This means the same color pattern can be displayed at different brightness levels.

---

## 9. Serial Brightness Input

The ESP32 can also receive a brightness value through the serial connection.

The program checks whether data has been received:

```python
events = poll.poll(0)
```

When a value is received:

```python
brightness = int(line)
```

The value is limited between **0 and 255**.

For example:

```text
50
```

sets low brightness.

```text
150
```

sets medium brightness.

```text
255
```

sets maximum brightness.

After changing the brightness, the LED pattern is displayed again.

---

## 10. Touch Detection Protection

The variable:

```python
touched = False
```

is used to prevent one continuous touch from changing the pattern repeatedly.

When a touch is detected:

```python
touched = True
```

The program then waits until the finger is removed.

When the sensor value returns close to the baseline:

```python
if difference < threshold * 0.4:
    touched = False
```

the system becomes ready for the next touch.

This makes the project work as:

```text
Touch
  ↓
Detect
  ↓
Change Pattern Once
  ↓
Finger Removed
  ↓
Ready for Next Touch
```

---

## 11. Complete MicroPython Program

```python
from machine import Pin, TouchPad
import neopixel
import time
import sys
import uselect

# -------------------------
# LED STRIP SETTINGS
# -------------------------

NUM_LEDS = 30
np = neopixel.NeoPixel(Pin(4, Pin.OUT), NUM_LEDS)

# -------------------------
# TOUCH SENSOR GPIO 14
# -------------------------

touch = TouchPad(Pin(14))

# -------------------------
# LED PATTERNS
# -------------------------

patterns = [

    [
        (255, 0, 0),
        (0, 255, 0),
        (0, 0, 255),
        (255, 255, 0),
        (255, 0, 255)
    ],

    [
        (0, 255, 255),
        (255, 100, 0),
        (150, 0, 255),
        (0, 255, 100)
    ],

    [
        (255, 255, 255),
        (255, 0, 0),
        (0, 0, 255)
    ]
]

pattern_index = 0
brightness = 255


# -------------------------
# SHOW LED WITH BRIGHTNESS
# -------------------------

def show_pattern():

    colors = patterns[pattern_index]

    for i in range(NUM_LEDS):

        color = colors[i % len(colors)]

        r = color[0] * brightness // 255
        g = color[1] * brightness // 255
        b = color[2] * brightness // 255

        np[i] = (r, g, b)

    np.write()


show_pattern()


# -------------------------
# CALIBRATE TOUCH
# -------------------------

print("Calibrating...")
time.sleep(2)

total = 0

for i in range(20):
    total += touch.read()
    time.sleep(0.05)

baseline = total / 20

print("Baseline:", baseline)

threshold = baseline * 0.30 + 5000

print("Touch threshold:", threshold)


# -------------------------
# SERIAL INPUT SETUP
# -------------------------

poll = uselect.poll()
poll.register(sys.stdin, uselect.POLLIN)


# -------------------------
# MAIN LOOP
# -------------------------

touched = False

while True:

    # RECEIVE MUSIC VALUE FROM LAPTOP
    events = poll.poll(0)

    if events:

        try:
            line = sys.stdin.readline().strip()

            if line:
                brightness = int(line)

                if brightness > 255:
                    brightness = 255

                if brightness < 0:
                    brightness = 0

                show_pattern()

                print("Music brightness:", brightness)

        except:
            pass


    # TOUCH SENSOR
    value = touch.read()
    difference = abs(value - baseline)


    # CHANGE COLOR PATTERN ON TOUCH
    if difference > threshold and not touched:

        touched = True

        pattern_index += 1

        if pattern_index >= len(patterns):
            pattern_index = 0

        show_pattern()

        print("TOUCH DETECTED!")
        print("COLOR CHANGED!")

        time.sleep(0.5)


    # FINGER REMOVED
    if difference < threshold * 0.4:
        touched = False


    time.sleep(0.02)
```

---

## 12. Working Flow

```text
ESP32-S3 Starts
       ↓
Initialize WS2812B Strip
       ↓
Initialize GPIO 14 Touch Sensor
       ↓
Calibrate Touch Sensor
       ↓
Calculate Baseline & Threshold
       ↓
Display Initial LED Pattern
       ↓
       ┌─────────────────────┐
       │     Main Loop       │
       └─────────────────────┘
          ↓             ↓
   Serial Input      Touch Input
          ↓             ↓
 Change Brightness   Detect Touch
          ↓             ↓
   Update LEDs       Next Pattern
          ↓             ↓
          └──────┬──────┘
                 ↓
             Repeat
```

---

## 13. Result

The **Touch-Controlled RGB LED Strip** was successfully implemented using the ESP32-S3.

The system can:

* Detect touch through **GPIO 14**
* Control **30 WS2812B RGB LEDs**
* Change LED patterns when touched
* Cycle through multiple predefined patterns
* Control LED brightness
* Receive brightness values through serial communication
* Prevent repeated pattern changes from a continuous touch

---

## 14. Conclusion

This project demonstrates how an **ESP32-S3**, a touch/sensing input, and a **WS2812B addressable RGB LED strip** can be combined to create an interactive lighting system.

The touch input provides a simple human interface, while the ESP32 processes the sensor readings and controls the RGB LED strip in real time.
