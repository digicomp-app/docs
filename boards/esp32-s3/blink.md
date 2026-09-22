---
title: Blink - Micropython
---

# ESP32-S3 LED Blink - Micropython

 This example blinks the **on-board LED connected to GPIO 21** using MicroPython.

 ## Hardware

 | Item | Details |
| --- | --- |
| Board | **Digicomp ESP32 S3 Dev Board** |
| Microcontroller | ESP32-S3 |
| Programming language | MicroPython |
| On-board LED | GPIO 21 |

## MicroPython Code

 Save the following as `main.py` on the board:

```
from machine import Pin
from time import sleep

# On-board LED is connected to GPIO 21
led = Pin(21, Pin.OUT)

while True:
    led.on()
    sleep(1)

    led.off()
    sleep(1)
```

 ## How It Works

 The program first imports `Pin` from the `machine` module and `sleep` from the `time` module.

```
from machine import Pin
from time import sleep
```

 GPIO 21 is configured as a digital output:

```
led = Pin(21, Pin.OUT)
```

 The `while True` loop then repeatedly turns the LED on and off:

```
led.on()
sleep(1)

led.off()
sleep(1)
```

 Each state lasts **1 second**, producing a blink rate of approximately **0.5 Hz** (one complete on/off cycle every 2 seconds).

 ## Uploading to the Board

 1. Install a suitable MicroPython firmware for the **ESP32-S3**.
2. Connect the Digicomp ESP32 S3 Dev Board to your computer using USB.
3. Open a MicroPython-compatible IDE or serial REPL, such as **Thonny**.
4. Make sure the board is running MicroPython.
5. Create a file named:

   ```
   main.py
   ```
6. Copy the blink program into `main.py`.
7. Save `main.py` to the ESP32-S3 board.
8. Reset the board.

 The on-board LED connected to **GPIO 21** should start blinking.

 ## Expected Behavior

```
LED ON  →  1 second
LED OFF →  1 second
LED ON  →  1 second
LED OFF →  1 second
...
```
