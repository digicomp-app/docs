---
title: Touch Test
---


# Touch Test on ST7789 LCD

**A Touch-Triggered Alphabet Display on ST7789 LCD.**

---

##  Objective

To verify that the capacitive touch panel and the ST7789 LCD of the Waveshare 1.69" touch display work together on an Digicomp ESP32-S3 dev board. Each time the screen is touched, the program:

1. Reads the touch coordinates from the CST816T controller over I²C.
2. Draws the next letter of the alphabet (A → B → C → … → Z) in white at the touched position.
3. Prints the coordinates and the letter on the serial console.

This confirms both the display path (SPI) and the touch path (I²C) in a single test.

---

##  Hardware Used

| Component | Details |
|---|---|
| Microcontroller | Digicomp ESP32-S3 dev board |
| Display | Waveshare 1.69" LCD, ST7789 driver, 240 × 280 pixels |
| Touch controller | CST816T|
| Firmware | MicroPython |


---

##  Pin Connections

| 12-pin LCD/Touch pin | ESP32-S3 pin | Function |
|---|---|---|
| VCC | 3.3V | Power |
| GND | GND | Ground |
| DIN / MOSI | GPIO 7 | LCD SPI data |
| CLK / SCLK | GPIO 6 | LCD SPI clock |
| CS | GPIO 5 | LCD chip select |
| DC | GPIO 8 | LCD data/command |
| RST | GPIO 15 | LCD reset |
| BL | GPIO 4 | Backlight |
| TPSDA | GPIO 11 | Touch I²C SDA |
| TPSCL | GPIO 12 | Touch I²C SCL |
| TPRST | GPIO 9 | Touch reset |
| TPIRQ | GPIO 10 | Touch interrupt |

### Confirmed by test

| Parameter | Value |
|---|---|
| Touch I²C address | `0x15` |
| Touch controller | CST816T |

---

##  Communication Interfaces

###  LCD: SPI

| Setting | Value |
|---|---|
| SPI bus | SPI(2) |
| Baud rate | 80 MHz |
| Polarity / Phase | 0 / 0 |
| SCK / MOSI | GPIO 6 / GPIO 7 |
| Control lines | CS = GPIO 5, DC = GPIO 8, RST = GPIO 15, BL = GPIO 4 |

The ST7789 is write-only in this design: commands are sent with DC = 0, and pixel or parameter data with DC = 1.

### Touch: I²C

| Setting | Value |
|---|---|
| I²C bus | I2C(0) |
| SCL / SDA | GPIO 12 / GPIO 11 |
| Frequency | 400 kHz |
| Device address | `0x15` |
| Reset / Interrupt | GPIO 9 / GPIO 10 |

---

##  Program Flow

```
Start
  │
  ├─ Configure SPI, I²C and control pins
  ├─ Reset and initialise ST7789
  ├─ Clear screen to black
  ├─ Read CST816T chip ID (print to console)
  │
  └─ Loop every 30 ms
        │
        ├─ read_touch()
        │     ├─ None → last_touch = False
        │     └─ (x, y) and last_touch is False
        │           ├─ pick alphabet[letter_index]
        │           ├─ print X, Y, letter
        │           ├─ draw_letter(letter, x, y)
        │           ├─ letter_index = (letter_index + 1) mod 26
        │           └─ last_touch = True
        └─ sleep 30 ms
```

---

## Expected Output

**On the LCD:** a black screen. Each tap places the next white letter, starting with A, at the point touched.

**On the serial console:**

```
Starting touch alphabet test
CST816T chip ID: 0xb5
Touch the screen.
A -> B -> C -> ... -> Z
Touch: X = 118 Y = 140 Letter = A
Touch: X = 60 Y = 200 Letter = B
...
```

(Coordinates are examples and will vary with where you touch.)

---


##  Result

The test confirmed that:

- The ST7789 LCD initialises correctly over SPI at 80 MHz with the 20-pixel Y offset.
- The CST816T is detected at I²C address `0x15` with chip ID `0xB5`.
- Touch coordinates are read correctly and mapped to LCD pixel positions.
- Letters A–Z are drawn one per tap at the touched position.

This provides a working base for touch-driven interfaces such as menus, on-screen keypads, games and smart displays.

---


## Complete Source Code

```python
from machine import Pin, SPI, I2C
import time


# ============================================================
# LCD: ST7789 240 x 280
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
# TOUCH: CST816T
# ============================================================

i2c = I2C(
    0,
    scl=Pin(12),
    sda=Pin(11),
    freq=400000
)

TPRST = Pin(9, Pin.OUT, value=1)
TPIRQ = Pin(10, Pin.IN)


# ============================================================
# LCD FUNCTIONS
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


def set_window(x0, y0, x1, y1):

    cmd(0x2A)

    data(bytes([
        x0 >> 8,
        x0 & 255,
        x1 >> 8,
        x1 & 255
    ]))

    # Your display has a 20 pixel Y offset
    y0 += 20
    y1 += 20

    cmd(0x2B)

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

# RGB565
cmd(0x3A)
data(b'\x55')

# Memory access
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
# CLEAR SCREEN
# ============================================================

set_window(0, 0, 239, 279)

black_row = b'\x00\x00' * 240

cs.value(0)
dc.value(1)

for _ in range(280):
    spi.write(black_row)

cs.value(1)


# ============================================================
# 5 x 7 FONT
# ============================================================

FONT = {

    "A": (
        0b01110,
        0b10001,
        0b10001,
        0b11111,
        0b10001,
        0b10001,
        0b10001
    ),

    "B": (
        0b11110,
        0b10001,
        0b10001,
        0b11110,
        0b10001,
        0b10001,
        0b11110
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

    "D": (
        0b11110,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b11110
    ),

    "E": (
        0b11111,
        0b10000,
        0b10000,
        0b11110,
        0b10000,
        0b10000,
        0b11111
    ),

    "F": (
        0b11111,
        0b10000,
        0b10000,
        0b11110,
        0b10000,
        0b10000,
        0b10000
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

    "H": (
        0b10001,
        0b10001,
        0b10001,
        0b11111,
        0b10001,
        0b10001,
        0b10001
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

    "J": (
        0b00111,
        0b00010,
        0b00010,
        0b00010,
        0b10010,
        0b10010,
        0b01100
    ),

    "K": (
        0b10001,
        0b10010,
        0b10100,
        0b11000,
        0b10100,
        0b10010,
        0b10001
    ),

    "L": (
        0b10000,
        0b10000,
        0b10000,
        0b10000,
        0b10000,
        0b10000,
        0b11111
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

    "N": (
        0b10001,
        0b11001,
        0b10101,
        0b10011,
        0b10001,
        0b10001,
        0b10001
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

    "P": (
        0b11110,
        0b10001,
        0b10001,
        0b11110,
        0b10000,
        0b10000,
        0b10000
    ),

    "Q": (
        0b01110,
        0b10001,
        0b10001,
        0b10001,
        0b10101,
        0b10010,
        0b01101
    ),

    "R": (
        0b11110,
        0b10001,
        0b10001,
        0b11110,
        0b10100,
        0b10010,
        0b10001
    ),

    "S": (
        0b01111,
        0b10000,
        0b10000,
        0b01110,
        0b00001,
        0b00001,
        0b11110
    ),

    "T": (
        0b11111,
        0b00100,
        0b00100,
        0b00100,
        0b00100,
        0b00100,
        0b00100
    ),

    "U": (
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b01110
    ),

    "V": (
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b01010,
        0b00100
    ),

    "W": (
        0b10001,
        0b10001,
        0b10001,
        0b10101,
        0b10101,
        0b11011,
        0b10001
    ),

    "X": (
        0b10001,
        0b10001,
        0b01010,
        0b00100,
        0b01010,
        0b10001,
        0b10001
    ),

    "Y": (
        0b10001,
        0b10001,
        0b01010,
        0b00100,
        0b00100,
        0b00100,
        0b00100
    ),

    "Z": (
        0b11111,
        0b00001,
        0b00010,
        0b00100,
        0b01000,
        0b10000,
        0b11111
    )
}


# ============================================================
# DRAW ONE LETTER
# ============================================================

SCALE = 4


def draw_letter(letter, x, y):

    bitmap = FONT[letter]

    width = 5 * SCALE
    height = 7 * SCALE

    # Make letter buffer
    buf = bytearray(width * height * 2)

    for row in range(7):

        for col in range(5):

            if bitmap[row] & (1 << (4 - col)):

                for sy in range(SCALE):

                    for sx in range(SCALE):

                        px = col * SCALE + sx
                        py = row * SCALE + sy

                        p = (py * width + px) * 2

                        # WHITE
                        buf[p] = 0xFF
                        buf[p + 1] = 0xFF

    # Keep letter inside screen
    if x + width > 240:
        x = 240 - width

    if y + height > 280:
        y = 280 - height

    if x < 0:
        x = 0

    if y < 0:
        y = 0

    set_window(
        x,
        y,
        x + width - 1,
        y + height - 1
    )

    cs.value(0)
    dc.value(1)

    spi.write(buf)

    cs.value(1)


# ============================================================
# CST816T READ
# ============================================================

TOUCH_ADDR = 0x15

# CST816T registers:
# 0x01 = gesture
# 0x02 = finger number
# 0x03 = X high / event
# 0x04 = X low
# 0x05 = Y high / event
# 0x06 = Y low


def read_touch():

    try:

        data = i2c.readfrom_mem(
            TOUCH_ADDR,
            0x02,
            5
        )

        fingers = data[0]

        if fingers == 0:
            return None

        x = ((data[1] & 0x0F) << 8) | data[2]

        y = ((data[3] & 0x0F) << 8) | data[4]

        if x > 239:
            x = 239

        if y > 279:
            y = 279

        return x, y

    except OSError:
        return None


# ============================================================
# CHECK TOUCH CONTROLLER
# ============================================================

print("Starting touch alphabet test")

try:

    chip = i2c.readfrom_mem(
        TOUCH_ADDR,
        0xA7,
        1
    )[0]

    print("CST816T chip ID:", hex(chip))

except Exception as e:

    print("Touch controller error:", e)

    print("Check:")
    print("TPSDA -> GPIO 11")
    print("TPSCL -> GPIO 12")
    print("TPRST -> GPIO 9")
    print("TPIRQ -> GPIO 10")


# ============================================================
# ALPHABET
# ============================================================

alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

letter_index = 0

last_touch = False

print("Touch the screen.")
print("A -> B -> C -> ... -> Z")


# ============================================================
# MAIN LOOP
# ============================================================

while True:

    touch = read_touch()

    if touch is not None:

        x, y = touch

        # New touch only
        if not last_touch:

            letter = alphabet[letter_index]

            print(
                "Touch:",
                "X =", x,
                "Y =", y,
                "Letter =", letter
            )

            draw_letter(
                letter,
                x,
                y
            )

            letter_index += 1

            if letter_index >= 26:
                letter_index = 0

            last_touch = True

    else:

        last_touch = False

    time.sleep_ms(30)
```

---

## 12. Conclusion

The touch test shows that the Waveshare 1.69" ST7789 display and its CST816T touch controller work correctly with the Digicomp ESP32-S3 dev board in MicroPython. SPI at 80 MHz drives the display quickly, the I²C touch controller reports accurate coordinates, and the "one tap = one letter" logic gives a simple visual confirmation of the whole hardware chain.
