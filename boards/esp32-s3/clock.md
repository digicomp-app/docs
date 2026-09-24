---
title: Analog Clock
---



# Analog Clock on a ST7789 LCD using RAM Framebuffer

*Using Digicomp ESP32-S3 Dev board and MicroPython*

## Project Title

Analog Clock on ST7789 LCD

## Objective

The objective of this project was to draw a live analog clock face — hour, minute, and second hands — on a Waveshare 1.69-inch, 240 × 280 ST7789 Touch LCD, driven by a Digicomp ESP32-S3 Dev board over SPI using MicroPython.

Instead of drawing shapes directly to the display, the entire clock face is built each tick inside a RAM framebuffer using MicroPython's framebuf module, and only the finished frame is pushed to the LCD in one SPI transfer. Time is read from the ESP32's onboard RTC.

## Hardware Used

| Component | Details |
| --- | --- |
| Microcontroller | Digicomp ESP32-S3 Dev board |
| Display | Waveshare 1.69-inch TFT LCD ST7789 |
| Resolution | 240 × 280 pixels |
| Programming Language | MicroPython |


## Hardware Connections

| Waveshare LCD | Digicomp ESP32-S3 | Function |
| --- | --- | --- |
| VCC | 3.3V | Power |
| GND | GND | Ground |
| DIN / MOSI | GPIO 7 | SPI data |
| CLK / SCLK | GPIO 6 | SPI clock |
| CS | GPIO 5 | Chip select |
| DC | GPIO 8 | Data/Command |
| RST | GPIO 15 | LCD reset |
| BL | GPIO 4 | Backlight |

## SPI Configuration

```python
spi = SPI(
    2,
    baudrate=80000000,
    polarity=0,
    phase=0,
    sck=Pin(6),
    mosi=Pin(7)
)
```

The same 80 MHz high-speed SPI setup from the high-speed  display was reused, since a full-screen clock frame (134,400 bytes) needs to be transferred every second.

## RAM Framebuffer Technique

The core idea is to treat a bytearray in RAM as the entire screen, draw the whole clock into it using framebuf, and only then send it to the LCD as one block — instead of issuing individual SPI commands per shape.

```
Allocate RGB565 buffer (240 × 280 × 2 bytes)
        ↓
Wrap buffer in a framebuf.FrameBuffer object
        ↓
Each tick: clear buffer, draw face + hands into RAM
        ↓
Set LCD window to full screen (once)
        ↓
Send entire buffer over SPI in one write
        ↓
Repeat every second
```

This keeps flicker to a minimum and avoids the overhead of setting the LCD address window for every line or pixel, since the whole 240 × 280 frame is composited in memory first.

The framebuffer is allocated once at startup:

```python
buffer = bytearray(WIDTH * HEIGHT * 2)

fb = framebuf.FrameBuffer(
    buffer,
    WIDTH,
    HEIGHT,
    framebuf.RGB565
)
```

## Drawing the Clock Face

Everything below is drawn into RAM only — nothing reaches the LCD until show() is called.

- **Circle primitive** — the framebuf build in use has no built-in circle(), so a midpoint-circle algorithm is implemented manually (circle(cx, cy, r, color)), plotting 8 symmetric points per step.
- **Face** — three concentric circles (outer rim, ring, inner face) are drawn at the clock center (120, 140), radius 115.
- **Minute markers** — all 60 tick marks are drawn around the dial using trigonometry (math.cos / math.sin); every 5th marker (the hour marks) is drawn longer and in white, the rest shorter and gray.
- **Hands** — hour, minute, and second hands are drawn as lines from the center (fb.line) at angles computed from the current time:
  - Hour hand: hour % 12 * 30 + minute * 0.5 degrees, length 62, white
  - Minute hand: minute * 6 + second * 0.1 degrees, length 88, cyan
  - Second hand: second * 6 degrees, length 100, red, with a short red counterweight on the opposite side
- **Center hub** — a small red square with a white square on top (fb.fill_rect) caps the hand pivot.

## Result

The Digicomp ESP32-S3 Dev board successfully renders a smooth, flicker-free analog clock on the Waveshare ST7789 LCD, with the face, 60 minute markers, and three moving hands all composited in RAM each second and pushed to the display in one high-speed SPI transfer.

The implementation demonstrated:

- RAM framebuffer graphics using framebuf.FrameBuffer
- A custom circle-drawing algorithm
- Trigonometric hand/marker positioning
- Live time from the onboard RTC
- Full-frame, single-transfer SPI updates at 80 MHz
- Redraw-on-change logic to minimize unnecessary SPI traffic

## Conclusion

This project extends the earlier  text-display work into full graphics: rather than drawing individual shapes directly to the LCD, the complete scene is first composed in a RAM framebuffer and then blitted to the display in one transfer. The same wiring, SPI configuration, and windowing routine carry over unchanged, showing that the RAM-buffered approach scales cleanly from static text to a continuously updating analog display.

## Appendix: Complete Source Code

```python
from machine import Pin, SPI, RTC
import framebuf
import time
import math
import gc


# ============================================================
# ESP32-S3 + Waveshare 1.69" ST7789
# 240 x 280
#
# SAME WIRING
#
# SCK  -> GPIO 6
# MOSI -> GPIO 7
# CS   -> GPIO 5
# DC   -> GPIO 8
# RST  -> GPIO 15
# BL   -> GPIO 4
# ============================================================

WIDTH = 240
HEIGHT = 280


# ============================================================
# SPI
# ============================================================

spi = SPI(
    2,
    baudrate=80000000,
    polarity=0,
    phase=0,
    sck=Pin(6),
    mosi=Pin(7)
)

cs = Pin(5, Pin.OUT, value=1)
dc = Pin(8, Pin.OUT)
rst = Pin(15, Pin.OUT)
bl = Pin(4, Pin.OUT, value=1)


# ============================================================
# LCD COMMAND
# ============================================================

def cmd(c):
    cs.value(0)
    dc.value(0)
    spi.write(bytes([c]))
    cs.value(1)


def data(d):
    cs.value(0)
    dc.value(1)
    spi.write(d)
    cs.value(1)


# ============================================================
# LCD WINDOW
# ============================================================

def set_window(x0, y0, x1, y1):

    cmd(0x2A)

    data(bytes([
        x0 >> 8,
        x0 & 255,
        x1 >> 8,
        x1 & 255
    ]))

    cmd(0x2B)

    # Waveshare vertical offset
    y0 += 20
    y1 += 20

    data(bytes([
        y0 >> 8,
        y0 & 255,
        y1 >> 8,
        y1 & 255
    ]))

    cmd(0x2C)


# ============================================================
# LCD RESET
# ============================================================

rst.value(1)
time.sleep_ms(100)

rst.value(0)
time.sleep_ms(100)

rst.value(1)
time.sleep_ms(150)


# ============================================================
# ST7789 INITIALIZATION
# ============================================================

cmd(0x01)
time.sleep_ms(150)

cmd(0x11)
time.sleep_ms(150)

cmd(0x3A)
data(b'\x55')

cmd(0x36)
data(b'\x00')

cmd(0x21)

cmd(0x13)

cmd(0x29)
time.sleep_ms(100)


# ============================================================
# RAM FRAMEBUFFER
# ============================================================

gc.collect()

print("Free RAM before framebuffer:", gc.mem_free())

# RGB565
# 240 × 280 × 2 = 134400 bytes

buffer = bytearray(
    WIDTH * HEIGHT * 2
)

# MicroPython framebuffer object
fb = framebuf.FrameBuffer(
    buffer,
    WIDTH,
    HEIGHT,
    framebuf.RGB565
)

gc.collect()

print("Framebuffer:", len(buffer), "bytes")
print("Free RAM after framebuffer:", gc.mem_free())


# ============================================================
# COLORS
# ============================================================

BLACK  = 0x0000
WHITE  = 0xFFFF
RED    = 0xF800
CYAN   = 0x07FF
GRAY   = 0x8410
DARK   = 0x2104
YELLOW = 0xFFE0


# ============================================================
# CLOCK CENTER
# ============================================================

CX = 120
CY = 140

R = 115


# ============================================================
# CIRCLE
# We implement our own because your framebuf build
# doesn't provide FrameBuffer.circle()
# ============================================================

def circle(cx, cy, r, color):

    x = r
    y = 0
    d = 1 - r

    while x >= y:

        fb.pixel(cx + x, cy + y, color)
        fb.pixel(cx + y, cy + x, color)
        fb.pixel(cx - y, cy + x, color)
        fb.pixel(cx - x, cy + y, color)

        fb.pixel(cx - x, cy - y, color)
        fb.pixel(cx - y, cy - x, color)
        fb.pixel(cx + y, cy - x, color)
        fb.pixel(cx + x, cy - y, color)

        y += 1

        if d <= 0:

            d += 2 * y + 1

        else:

            x -= 1
            d += 2 * (y - x) + 1


# ============================================================
# DRAW CLOCK FACE INTO RAM
# ============================================================

def draw_face():

    # --------------------------------------------------------
    # CLEAR RAM BUFFER
    # --------------------------------------------------------

    fb.fill(BLACK)

    # --------------------------------------------------------
    # OUTER CIRCLE
    # --------------------------------------------------------

    circle(
        CX,
        CY,
        R,
        WHITE
    )

    # --------------------------------------------------------
    # SECOND CIRCLE
    # --------------------------------------------------------

    circle(
        CX,
        CY,
        R - 2,
        GRAY
    )

    # --------------------------------------------------------
    # INNER CIRCLE
    # --------------------------------------------------------

    circle(
        CX,
        CY,
        R - 7,
        DARK
    )

    # --------------------------------------------------------
    # 60 MINUTE MARKERS
    # --------------------------------------------------------

    for i in range(60):

        angle = math.radians(
            i * 6 - 90
        )

        if i % 5 == 0:

            r1 = R - 18
            r2 = R - 7

            color = WHITE

        else:

            r1 = R - 11
            r2 = R - 7

            color = GRAY

        x1 = int(
            CX + math.cos(angle) * r1
        )

        y1 = int(
            CY + math.sin(angle) * r1
        )

        x2 = int(
            CX + math.cos(angle) * r2
        )

        y2 = int(
            CY + math.sin(angle) * r2
        )

        fb.line(
            x1,
            y1,
            x2,
            y2,
            color
        )


# ============================================================
# DRAW CLOCK HAND
# ============================================================

def draw_hand(angle, length, color):

    rad = math.radians(
        angle - 90
    )

    x = int(
        CX + math.cos(rad) * length
    )

    y = int(
        CY + math.sin(rad) * length
    )

    fb.line(
        CX,
        CY,
        x,
        y,
        color
    )


# ============================================================
# DRAW COMPLETE FRAME INTO RAM
# ============================================================

def draw_clock(hour, minute, second):

    # Everything below happens in RAM.
    # Nothing is sent to the LCD yet.

    draw_face()

    # --------------------------------------------------------
    # HOUR HAND
    # --------------------------------------------------------

    hour_angle = (
        (hour % 12) * 30
        + minute * 0.5
    )

    draw_hand(
        hour_angle,
        62,
        WHITE
    )

    # --------------------------------------------------------
    # MINUTE HAND
    # --------------------------------------------------------

    minute_angle = (
        minute * 6
        + second * 0.1
    )

    draw_hand(
        minute_angle,
        88,
        CYAN
    )

    # --------------------------------------------------------
    # SECOND HAND
    # --------------------------------------------------------

    second_angle = second * 6

    rad = math.radians(
        second_angle - 90
    )

    sx = int(
        CX + math.cos(rad) * 100
    )

    sy = int(
        CY + math.sin(rad) * 100
    )

    fb.line(
        CX,
        CY,
        sx,
        sy,
        RED
    )

    # Counterweight

    bx = int(
        CX - math.cos(rad) * 18
    )

    by = int(
        CY - math.sin(rad) * 18
    )

    fb.line(
        CX,
        CY,
        bx,
        by,
        RED
    )

    # --------------------------------------------------------
    # CENTER
    # --------------------------------------------------------

    fb.fill_rect(
        CX - 4,
        CY - 4,
        9,
        9,
        RED
    )

    fb.fill_rect(
        CX - 2,
        CY - 2,
        5,
        5,
        WHITE
    )


# ============================================================
# SEND RAM BUFFER TO LCD
# ============================================================

def show():

    # Tell ST7789 that the following data belongs
    # to the entire 240 x 280 display.

    set_window(
        0,
        0,
        239,
        279
    )

    # Send framebuffer
    cs.value(0)
    dc.value(1)

    spi.write(buffer)

    cs.value(1)


# ============================================================
# RTC
# ============================================================

rtc = RTC()


# ============================================================
# OPTIONAL TIME SETTING
# ============================================================

# If your RTC is not already correct, set it once:
#
# rtc.datetime(
#     (2026, 9, 19, 5, 13, 50, 0, 0)
# )


# ============================================================
# CLOCK
# ============================================================

last_second = -1

print("RAM framebuffer analog clock")
print("Starting...")


while True:

    now = rtc.datetime()

    hour = now[4]
    minute = now[5]
    second = now[6]

    # Only create a new frame when time changes

    if second != last_second:

        last_second = second

        # ====================================================
        # STEP 1
        # Draw EVERYTHING into RAM
        # ====================================================

        draw_clock(
            hour,
            minute,
            second
        )

        # ====================================================
        # STEP 2
        # Send RAM framebuffer to LCD
        # ====================================================

        show()

        print(
            "{:02d}:{:02d}:{:02d}".format(
                hour,
                minute,
                second
            )
        )

    time.sleep_ms(20)
```

---


