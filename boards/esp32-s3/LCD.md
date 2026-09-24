---
title: Text Display
---


# High-Speed Digicomp Text Display on a Waveshare 1.69-inch ST7789 LCD

*Using Digicomp ESP32-S3 Dev board and MicroPython*

## Project Title

Text Display on ST7789 LCD

## Objective

The objective of this project was to interface a Waveshare 1.69-inch, 240 × 280 ST7789 TFT LCD with the Digicomp ESP32-S3 Dev board using SPI communication and display the word "Digicomp" in white on a black background.

The project used a RAM-buffered rendering technique in which the complete Digicomp image was first constructed in RAM and then transferred to the LCD using a single display window and large SPI data transfers.

## Hardware Used

| Component | Details |
| --- | --- |
| Microcontroller | Digicomp ESP32-S3 Dev board |
| ESP32 Module | ESP32-S3-WROOM-1-N16R8 |
| Display | Waveshare 1.69-inch TFT LCD |
| Display Controller | ST7789 |
| Resolution | 240 × 280 pixels |
| Programming Language | MicroPython v1.29.0  |


## LCD Connections

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

The Digicomp ESP32-S3 Dev board was configured to communicate with the ST7789 using SPI.

The high-speed test used an SPI clock of 80 MHz:

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

## RAM and Text Rendering

Instead of drawing every pixel individually, the program generated the complete "Digicomp" bitmap in RAM.

The process was:

```
Create Digicomp bitmap
        ↓
Store bitmap in RAM
        ↓
Set LCD window once
        ↓
Send large SPI data block
        ↓
Display Digicomp
```

This avoids repeatedly setting the LCD address for every individual pixel.

**Text Rendering**

A 5 × 7 bitmap font was used for:

```
D i g i c o m p
```

The characters were scaled and arranged horizontally.

The final image was centered on the 240 × 280 LCD.

White pixels used RGB565 0xFFFF , and the black background used 0x0000.

## Result

The Digicomp ESP32-S3 Dev board successfully communicated with the Waveshare ST7789 LCD and displayed "Digicomp" in white on a black background.

The implementation demonstrated:

- Successful SPI communication
- ST7789 initialization
- 240 × 280 display addressing
- RGB565 color output
- Bitmap text rendering
- RAM-based image construction
- Large-block SPI transfer
- High-speed 80 MHz SPI operation

## Conclusion

The project successfully demonstrated a RAM-buffered high-speed text display system using the DigiComp ESP32-S3  Dev board and Waveshare 1.69-inch ST7789 LCD.

The main optimization was changing from pixel-by-pixel drawing to building the complete text image in RAM and transferring it to the LCD as a larger block. This provides a more efficient foundation for future graphics, animations, and touchscreen applications.

## Appendix: Complete Source Code

The complete MicroPython program (main.py) used for the high-speed Digicomp display test is given below.

```python
from machine import Pin, SPI
import time


# ============================================================
# Digicomp ESP32-S3 Dev board
# Waveshare 1.69" ST7789
# 240 x 280
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


# ============================================================
# LCD DATA
# ============================================================

def data(d):

    cs.value(0)
    dc.value(1)

    spi.write(d)

    cs.value(1)


# ============================================================
# LCD WINDOW
# ============================================================

def set_window(x0, y0, x1, y1):

    # Column address
    cmd(0x2A)

    data(bytes([
        x0 >> 8,
        x0 & 255,
        x1 >> 8,
        x1 & 255
    ]))

    # Row address
    y0 += 20
    y1 += 20

    cmd(0x2B)

    data(bytes([
        y0 >> 8,
        y0 & 255,
        y1 >> 8,
        y1 & 255
    ]))

    # Memory write
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

# RGB565
cmd(0x3A)
data(b'\x55')

# Memory access control
cmd(0x36)
data(b'\x00')

# Inversion ON
cmd(0x21)

# Normal display
cmd(0x13)

# Display ON
cmd(0x29)
time.sleep_ms(100)


# ============================================================
# 5 x 7 FONT
# ============================================================

FONT = {

    "D": (
        0b11110,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b11110
    ),

    "I": (
        0b11111,
        0b00100,
        0b00100,
        0b00100,
        0b00100,
        0b00100,
        0b11111
    ),

    "G": (
        0b01110,
        0b10001,
        0b10000,
        0b10111,
        0b10001,
        0b10001,
        0b01110
    ),

    "C": (
        0b01110,
        0b10001,
        0b10000,
        0b10000,
        0b10000,
        0b10001,
        0b01110
    ),

    "O": (
        0b01110,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b01110
    ),

    "M": (
        0b10001,
        0b11011,
        0b10101,
        0b10101,
        0b10001,
        0b10001,
        0b10001
    ),

    "P": (
        0b11110,
        0b10001,
        0b10001,
        0b11110,
        0b10000,
        0b10000,
        0b10000
    )
}


# ============================================================
# TEXT SETTINGS
# ============================================================

TEXT = "DIGICOMP"

SCALE = 5

CHAR_W = 25
CHAR_H = 35

SPACE = 3


# ============================================================
# TEXT WIDTH
# ============================================================

TEXT_W = (
    len(TEXT) * CHAR_W
    + (len(TEXT) - 1) * SPACE
)

TEXT_H = CHAR_H


# ============================================================
# RAM BUFFER
#
# Complete DIGICOMP image is created here.
#
# RGB565 = 2 bytes per pixel
# ============================================================

text_buffer = bytearray(
    TEXT_W * TEXT_H * 2
)


# ============================================================
# BUILD DIGICOMP IN RAM
# ============================================================

xpos = 0

for letter in TEXT:

    bitmap = FONT[letter]

    for row in range(7):

        for col in range(5):

            # Pixel ON?
            if bitmap[row] & (
                1 << (4 - col)
            ):

                # Scale pixel
                for sy in range(SCALE):

                    for sx in range(SCALE):

                        x = (
                            xpos
                            + col * SCALE
                            + sx
                        )

                        y = (
                            row * SCALE
                            + sy
                        )

                        # RGB565 position
                        p = (
                            (y * TEXT_W + x)
                            * 2
                        )

                        # WHITE
                        text_buffer[p] = 0xFF
                        text_buffer[p + 1] = 0xFF

    xpos += CHAR_W + SPACE


# ============================================================
# CLEAR ENTIRE LCD
# ============================================================

set_window(
    0,
    0,
    239,
    279
)

black_row = b'\x00\x00' * 240

cs.value(0)
dc.value(1)

for _ in range(280):

    spi.write(black_row)

cs.value(1)


# ============================================================
# CENTER DIGICOMP
# ============================================================

x = (240 - TEXT_W) // 2
y = (280 - TEXT_H) // 2


# ============================================================
# SET ONLY THE TEXT WINDOW
# ============================================================

set_window(
    x,
    y,
    x + TEXT_W - 1,
    y + TEXT_H - 1
)


# ============================================================
# SEND RAM BUFFER
# ============================================================

cs.value(0)
dc.value(1)

# Large SPI transfer chunks
CHUNK = 4096

for start in range(
    0,
    len(text_buffer),
    CHUNK
):

    end = start + CHUNK

    if end > len(text_buffer):
        end = len(text_buffer)

    spi.write(
        text_buffer[start:end]
    )

cs.value(1)


# ============================================================
# DONE
# ============================================================

print("DIGICOMP displayed")
print("RAM buffer:", len(text_buffer), "bytes")


# ============================================================
# KEEP DISPLAY ON
# ============================================================

while True:

    time.sleep(1)

---

