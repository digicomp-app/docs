# Touch-Controlled RGB LED Strip

## 1. Project Title

**Touch-Controlled RGB LED Strip using Digicomp ESP32-S3 Dev Board**

---

## 2. Project Overview

This project uses an **Digicomp ESP32-S3 Dev Board** to control a **WS2812B addressable RGB LED strip** using a touch/sensing input.

The project supports three different touch actions:

- **Short Touch** → Changes the LED color
- **Long Touch (1 second or more)** → Activates rainbow animation
- **Double Touch** → Turns the LED strip ON/OFF

The program also performs automatic touch calibration and uses an increased touch sensitivity threshold for better touch detection.

---

## 3. Hardware Components

- Digicomp ESP32-S3 Dev Board-WROOM
- WS2812B RGB LED strip
- Touch/Sensing input
- Jumper wires
- USB cable
- Computer/Laptop
- Suitable 5V power supply

---

## 4. Pin Connections

| Component | Digicomp ESP32-S3 Dev Board Pin |
|---|---|
| WS2812B Data Input | GPIO 4 |
| Touch/Sensing Input | GPIO 14 |
| WS2812B GND | GND |
| LED Strip Power | External 5V / suitable power supply |

### Connection Summary

- **Digicomp ESP32-S3 Dev Board GPIO 4 → WS2812B Data IN**
- **Digicomp ESP32-S3 Dev Board GPIO 14 → Touch/Sensing input**
- **Digicomp ESP32-S3 Dev Board GND → LED Strip GND**
- **LED Strip Power → Suitable 5V power supply**

---

## 5. Software Used

- MicroPython
- VS Code
- MicroPico extension
- `neopixel` module
- `machine` module
- `time` module

---

## 6. How the Project Works

The project has three main parts:

1. RGB LED control
2. Touch/sensing input
3. Touch-based control actions

### 6.1 RGB LED Control

The WS2812B LED strip is connected to **GPIO 4**.

The program creates a NeoPixel object:

```python
NUM_LEDS = 30
```

---

### 6.2 Touch/Sensing Input

The touch/sensing input is connected to **GPIO 14**.

~~~python
touch = TouchPad(Pin(14))
~~~

The program automatically measures the normal touch sensor value during startup.

It takes 20 readings:

~~~python
total = 0

for i in range(20):
    total += touch.read()
    time.sleep(0.05)

baseline = total / 20
~~~

The average value is stored as the **baseline**.

---

### 6.3 Touch Sensitivity

The touch sensitivity is increased using the following threshold:

~~~python
threshold = baseline * 0.20 + 2000
~~~

The current touch value is compared with the baseline:

~~~python
difference = abs(value - baseline)
~~~

A touch is detected when:

~~~python
difference > threshold
~~~

This allows the system to detect lighter touches more easily.

**Note:** The touch sensor should not be touched during the initial calibration period.

---

## 7. LED Colors

The program contains six predefined colors:

~~~python
colors = [
    (255, 0, 0),
    (0, 255, 0),
    (0, 0, 255),
    (255, 255, 0),
    (255, 0, 255),
    (0, 255, 255)
]
~~~

The colors are:

1. Red
2. Green
3. Blue
4. Yellow
5. Purple
6. Cyan

The current color is selected using `color_index`.

---

## 8. Brightness Control

The program uses a brightness value of:

~~~python
brightness = 255
~~~

The RGB values are adjusted according to the brightness:

~~~python
r = color[0] * brightness // 255
g = color[1] * brightness // 255
b = color[2] * brightness // 255
~~~

This allows the LED brightness to be controlled through the program.

---

## 9. Short Touch Operation

A short touch is detected when the touch duration is **less than 1 second**.

The program changes to the next predefined color.

~~~python
color_index += 1

if color_index >= len(colors):
    color_index = 0

show_color(colors[color_index])
~~~

Each short touch moves to the next color.

After the last color, the program returns to the first color.

### Short Touch

**Short Touch → Change Color**

---

## 10. Long Touch Operation

A long touch is detected when the touch duration is **1 second or more**.

The program checks:

~~~python
if duration >= 1000:
~~~

When a long touch is detected, the rainbow animation starts:

~~~python
rainbow()
~~~

### Long Touch

**Long Touch (≥ 1 second) → Rainbow Animation**

---

## 11. Double Touch Operation

The program detects two short touches within approximately **800 milliseconds**.

The time between touches is checked using:

~~~python
if time.ticks_diff(current_time, last_touch_time) < 800:
~~~

When a double touch is detected:

~~~python
toggle_power()
~~~

The LED strip is either turned ON or OFF.

### Double Touch

**Double Touch → LED ON/OFF**

---

## 12. LED ON/OFF Control

The LED power state is stored using:

~~~python
power = True
~~~

The power state is changed using:

~~~python
power = not power
~~~

If the LED strip is ON, the current color is displayed.

If the LED strip is OFF, all LEDs are cleared:

~~~python
clear_strip()
~~~

The function used is:

~~~python
def toggle_power():
    global power

    power = not power

    if power:
        show_color(colors[color_index])
        print("LED STRIP ON")
    else:
        clear_strip()
        print("LED STRIP OFF")
~~~

---

## 13. Rainbow Animation

The rainbow animation is generated using a loop:

~~~python
for j in range(256):
~~~

Each LED receives a different RGB value based on its position.

The program calculates the RGB values for all 30 LEDs and updates the LED strip continuously.

~~~python
np.write()
time.sleep(0.01)
~~~

The rainbow animation continues while the LED strip is powered ON.

---

## 14. Touch Duration Detection

The program measures how long the touch sensor is activated.

When a touch starts:

~~~python
start_time = time.ticks_ms()
~~~

The program waits until the touch is released:

~~~python
while abs(touch.read() - baseline) > threshold:
    time.sleep(0.02)
~~~

When the touch ends:

~~~python
end_time = time.ticks_ms()
~~~

The duration is calculated using:

~~~python
duration = time.ticks_diff(end_time, start_time)
~~~

The duration determines whether the action is:

- Short touch
- Long touch
- Part of a double touch

---

## 15. Complete MicroPython Program

The complete program used in `main.py` is:

~~~python
from machine import Pin, TouchPad
import neopixel
import time

# -------------------------
# SETTINGS
# -------------------------

NUM_LEDS = 30



touch = TouchPad(Pin(14))

colors = [
    (255, 0, 0),      # Red
    (0, 255, 0),      # Green
    (0, 0, 255),      # Blue
    (255, 255, 0),    # Yellow
    (255, 0, 255),    # Purple
    (0, 255, 255)     # Cyan
]

color_index = 0
brightness = 255
power = True

# -------------------------
# CALIBRATION
# -------------------------

print("Calibrating...")
time.sleep(2)

total = 0

for i in range(20):
    total += touch.read()
    time.sleep(0.05)

baseline = total / 20

print("Baseline:", baseline)

# INCREASED TOUCH SENSITIVITY
threshold = baseline * 0.20 + 2000

print("Threshold:", threshold)

# -------------------------
# LED FUNCTIONS
# -------------------------

def clear_strip():
    for i in range(NUM_LEDS):
        np[i] = (0, 0, 0)
    np.write()


def show_color(color):
    if not power:
        clear_strip()
        return

    for i in range(NUM_LEDS):
        r = color[0] * brightness // 255
        g = color[1] * brightness // 255
        b = color[2] * brightness // 255

        np[i] = (r, g, b)

    np.write()


def change_color():
    global color_index

    color_index += 1

    if color_index >= len(colors):
        color_index = 0

    show_color(colors[color_index])

    print("COLOR CHANGED")


def rainbow():
    print("RAINBOW MODE")

    for j in range(256):

        if not power:
            return

        for i in range(NUM_LEDS):

            pixel = (i * 256 // NUM_LEDS + j) & 255

            if pixel < 85:
                r = pixel * 3
                g = 255 - pixel * 3
                b = 0

            elif pixel < 170:
                pixel -= 85
                r = 255 - pixel * 3
                g = 0
                b = pixel * 3

            else:
                pixel -= 170
                r = 0
                g = pixel * 3
                b = 255 - pixel * 3

            r = r * brightness // 255
            g = g * brightness // 255
            b = b * brightness // 255

            np[i] = (r, g, b)

        np.write()
        time.sleep(0.01)


def toggle_power():
    global power

    power = not power

    if power:
        show_color(colors[color_index])
        print("LED STRIP ON")
    else:
        clear_strip()
        print("LED STRIP OFF")


# -------------------------
# START
# -------------------------

show_color(colors[color_index])

print("Smart Touch RGB System Started!")
print()
print("SHORT TOUCH  = Change Color")
print("LONG TOUCH   = Rainbow")
print("DOUBLE TOUCH = ON/OFF")
print()

# -------------------------
# MAIN LOOP
# -------------------------

last_touch_time = 0

while True:

    value = touch.read()
    difference = abs(value - baseline)

    # TOUCH START
    if difference > threshold:

        start_time = time.ticks_ms()

        print("TOUCH START")

        # Wait while finger is touching
        while abs(touch.read() - baseline) > threshold:
            time.sleep(0.02)

        end_time = time.ticks_ms()

        duration = time.ticks_diff(end_time, start_time)

        print("Touch duration:", duration, "ms")

        # -------------------------
        # LONG TOUCH
        # -------------------------

        if duration >= 1000:

            print("LONG TOUCH DETECTED")

            rainbow()

        # -------------------------
        # SHORT TOUCH
        # -------------------------

        else:

            current_time = time.ticks_ms()

            # DOUBLE TOUCH
            if time.ticks_diff(current_time, last_touch_time) < 800:

                print("DOUBLE TOUCH DETECTED")

                toggle_power()

                last_touch_time = 0

            # SINGLE TOUCH
            else:

                print("SINGLE TOUCH")

                change_color()

                last_touch_time = current_time

        # Wait a little
        time.sleep(0.3)

    time.sleep(0.02)
~~~

---

## 16. Working Flow

~~~text
Digicomp ESP32-S3 Dev Board Starts
       ↓
Initialize WS2812B LED Strip
       ↓
Initialize Touch Input on GPIO 14
       ↓
Calibrate Touch Sensor
       ↓
Calculate Baseline
       ↓
Calculate Touch Threshold
       ↓
Display Initial LED Color
       ↓
Main Loop
       ↓
Detect Touch
       ↓
Measure Touch Duration
       ↓
 ┌───────────────┬────────────────┬─────────────────┐
 ↓               ↓                ↓
Short Touch    Long Touch      Double Touch
 ↓               ↓                ↓
Change Color   Rainbow Mode     ON/OFF
 └───────────────┴────────────────┴─────────────────┘
       ↓
Repeat
~~~

---

## 17. Program Execution

The project was developed and tested using **VS Code** with the **MicroPico extension**.

### Steps

1. Connect the Digicomp ESP32-S3 Dev Board to the computer using USB.
2. Open the project in VS Code.
3. Create or open `main.py`.
4. Insert the MicroPython program.
5. Save the program using **Ctrl + S**.
6. Connect the Digicomp ESP32-S3 Dev Board using MicroPico.
7. Upload/flash the program to the Digicomp ESP32-S3 Dev Board.
8. The program starts from `main.py`.
9. Test the touch operations.

---

## 18. Testing

| Test | Expected Result |
|---|---|
| Short Touch | LED color changes |
| Long Touch ≥ 1 second | Rainbow animation starts |
| Double Touch within 800 ms | LED strip turns ON/OFF |
| Light Touch | Improved touch detection |
| Power ON | Current LED color is displayed |
| Power OFF | All LEDs turn OFF |

The touch sensitivity was increased using:

~~~python
threshold = baseline * 0.20 + 2000
~~~

---

## 19. Result

The **Touch-Controlled RGB LED Strip using Digicomp ESP32-S3 Dev Board** was successfully implemented and tested.

The system successfully:

- Detects touch input through GPIO 14.
- Controls 30 WS2812B LEDs through GPIO 4.
- Changes color using a short touch.
- Activates rainbow animation using a long touch.
- Turns the LED strip ON/OFF using a double touch.
- Performs automatic touch calibration.
- Uses an increased touch sensitivity threshold.
- Supports brightness control.
- Provides multiple predefined RGB colors.

The final MicroPython program was successfully flashed to the Digicomp ESP32-S3 Dev Board and tested.

---

## 20. Advantages

- Simple touch-based control
- No physical buttons required
- Multiple functions using different touch actions
- Automatic touch calibration
- Increased touch sensitivity
- Multiple predefined colors
- Rainbow animation
- Brightness control
- Compact and easy to use
- Easy to modify and extend
- Suitable for DIY electronics projects

---

## 21. Applications

This project can be used for:

- Smart lighting
- Decorative lighting
- Room lighting
- Interactive LED displays
- DIY electronics projects
- Touch-based IoT systems
- Smart home lighting
- Educational electronics projects
- Interactive lighting systems

---

## 22. Conclusion

The **Touch-Controlled RGB LED Strip using Digicomp ESP32-S3 Dev Board** demonstrates how an Digicomp ESP32-S3 Dev Board can be used with a WS2812B addressable RGB LED strip and touch input to create an interactive lighting system.

The project provides three main touch-based controls:

- **Short Touch → Change Color**
- **Long Touch → Rainbow Animation**
- **Double Touch → ON/OFF**

Automatic calibration and increased touch sensitivity improve the reliability of touch detection.

The project was successfully implemented using **MicroPython, Digicomp ESP32-S3 Dev Board, WS2812B LEDs, and touch sensing**, and the final program was successfully tested and flashed to the Digicomp ESP32-S3 Dev Board.