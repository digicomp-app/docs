---
title: Light-Controlled Servo
---

# Light-Controlled Servo Motor and Dynamic LED

## Project Overview

This project uses an **Digicomp ESP32-S3 Dev Board** to automate a hardware system comprising an **LDR Light Sensor Module**, an **onboard LED**, and a **9g micro servo motor (DXW90 / SG90)**.

The system performs two main real-time functions based on ambient light levels:

- **Dynamic LED Dimming:** The onboard LED brightness scales proportionally with ambient darkness using Pulse Width Modulation (PWM).
- **Automated Servo Movement:** When ambient darkness crosses a set threshold, the 9g servo motor automatically rotates to a $90^\circ$ position. When ambient light returns, it returns to the home position ($0^\circ$).

---

## Hardware Components

- ESP32-S3 Dev Board-WROOM
- LDR Light Sensor Module (4-pin with potentiometer)
- 9g Micro Servo Motor (DXW90 / SG90)
- Onboard LED (GPIO 21)
- Jumper wires
- Micro-USB / USB-C Cable
- Computer/Laptop running Command Prompt (`cmd`)

---

## Pin Connections

| Component             | Pin Label              | ESP32-S3 Dev Board Pin | Notes / Function              |
| --------------------- | ---------------------- | ---------------------- | ----------------------------- |
| **LDR Sensor Module** | VCC (`+`)              | **3.3V**               | Sensor Power                  |
| **LDR Sensor Module** | GND (`-`)              | **GND**                | Sensor Ground                 |
| **LDR Sensor Module** | AO                     | **GPIO 4**             | Analog Light Intensity (ADC1) |
| **LDR Sensor Module** | DO                     | **GPIO 5**             | Digital Output Threshold      |
| **9g Servo Motor**    | Signal (Yellow/Orange) | **GPIO 6**             | 50Hz PWM Signal               |
| **9g Servo Motor**    | VCC (Red)              | **5V / VBUS**          | 5V Power Supply               |
| **9g Servo Motor**    | Ground (Brown/Black)   | **GND**                | Power Ground                  |
| **Onboard LED**       | Built-in               | **GPIO 21**             | Controlled via 16-bit PWM     |

### Connection Summary

- **LDR Module AO → ESP32-S3 GPIO 4**
- **LDR Module DO → ESP32-S3 GPIO 5**
- **LDR Module VCC → ESP32-S3 3.3V**
- **LDR Module GND → ESP32-S3 GND**
- **Servo Signal → ESP32-S3 GPIO 6**
- **Servo VCC → ESP32-S3 5V / VBUS**
- **Servo GND → ESP32-S3 GND**

---

## Software & Environment Setup

- **MicroPython Firmware:** Flashed onto the ESP32-S3
- **Command Line Tool:** `mpremote` (invoked via `python -m mpremote`)
- **Python Modules Used:**
- `machine` (Pin, ADC, PWM)
- `time` (sleep, delays)

---

## How the Project Works

The system operates in three main functional phases:

### Light Sensing (ADC & Digital Reads)

The LDR module's **Analog Output (AO)** is connected to **GPIO 4**. The ESP32-S3 uses a 12-bit Analog-to-Digital Converter (ADC) with 11dB attenuation ($0\text{V} - 3.3\text{V}$ range) to read values from `0` (Brightest) to `4095` (Darkest).

### Dynamic LED Brightness Scaling

The **onboard LED** on **GPIO 21** is driven using PWM at `500 Hz`. The raw ADC value from the LDR module is mapped directly to a 16-bit PWM duty cycle (`0` to `65535`):

$$\text{Duty Cycle} = \left(\frac{\text{Raw ADC}}{4095}\right) \times 65535$$

As ambient light decreases (higher ADC value), the LED duty cycle increases, making the LED shine brighter.

### Servo Motor Position Control

The **9g micro servo** on **GPIO 6** is driven using a `50 Hz` PWM frequency ($20\text{ ms}$ period). The pulse width is mapped between $0.5\text{ ms}$ (Duty ~1638) for $0^\circ$ and $2.5\text{ ms}$ (Duty ~8192) for $180^\circ$.

When ambient darkness crosses the defined threshold (`DARK_THRESHOLD = 2000`), the servo angle switches from $0^\circ$ to $90^\circ$.

---

## Complete MicroPython Program (`main.py`)

```python


import machine
import time

# =====================================================================
# 1. HARDWARE CONFIGURATION
# =====================================================================

LDR_AO_PIN = 4  # Analog Output (ADC1_CH3)
LDR_DO_PIN = 5  # Digital Output (Threshold trigger)
LED_PIN = 2     # Onboard LED (PWM)
SERVO_PIN = 6   # 9g Servo Signal Wire (PWM)

# Setup Analog Read for LDR
ldr_adc = machine.ADC(machine.Pin(LDR_AO_PIN))
ldr_adc.atten(machine.ADC.ATTN_11DB)  # Full 0V - 3.3V range (0 - 4095)

# Setup Digital Read for LDR Threshold Pin
ldr_do = machine.Pin(LDR_DO_PIN, machine.Pin.IN)

# Setup Onboard LED PWM (500 Hz for smooth, flicker-free dimming)
led_pwm = machine.PWM(machine.Pin(LED_PIN))
led_pwm.freq(500)

# Setup 9g Servo PWM (Standard 50 Hz control frequency)
servo_pwm = machine.PWM(machine.Pin(SERVO_PIN))
servo_pwm.freq(50)

# =====================================================================
# 2. HELPER FUNCTIONS
# =====================================================================

def set_servo_angle(angle):
    """
    Maps an angle (0-180 deg) to standard 50Hz PWM duty cycle.
    0 deg   ~ 0.5ms pulse (duty_u16 ~ 1638)
    180 deg ~ 2.5ms pulse (duty_u16 ~ 8192)
    """
    angle = max(0, min(180, angle))
    duty = int(1638 + (angle / 180.0) * (8192 - 1638))
    servo_pwm.duty_u16(duty)

def clear_outputs():
    """Turns off LED and disables PWM channels safely."""
    led_pwm.duty_u16(0)
    set_servo_angle(0)
    time.sleep(0.2)
    led_pwm.deinit()
    servo_pwm.deinit()

# =====================================================================
# 3. MAIN APPLICATION LOOP
# =====================================================================

print("--------------------------------------------------")
print("ESP32-S3 Light-Controlled Servo & LED System")
print("--------------------------------------------------")
print("Reading sensors... Press Ctrl+C in REPL to stop.\n")

DARK_THRESHOLD = 2000

try:
    while True:
        # Read LDR Analog Value (0 = Bright Light, 4095 = Dark)
        raw_ldr = ldr_adc.read()

        # Calculate darkness percentage (0.0 to 1.0)
        darkness_ratio = raw_ldr / 4095.0
        darkness_pct = darkness_ratio * 100.0

        # Read Digital Output Pin state
        digital_dark = ldr_do.value()

        # --- A. DYNAMIC LED BRIGHTNESS CONTROL ---
        led_duty = int(darkness_ratio * 65535)
        led_pwm.duty_u16(led_duty)

        # --- B. SERVO MOTOR CONTROL ---
        if raw_ldr > DARK_THRESHOLD:
            set_servo_angle(90)
            servo_status = "ROTATED (90°)"
        else:
            set_servo_angle(0)
            servo_status = "HOME (0°)"

        # Display telemetry in terminal
        print(f"LDR Raw: {raw_ldr:4d} | Darkness: {darkness_pct:5.1f}% | LED Duty: {led_duty:5d} | Servo: {servo_status}")

        time.sleep(0.1)

except KeyboardInterrupt:
    print("\nStopping system...")
    clear_outputs()
    print("System stopped cleanly.")

```

---

## Working Flow Chart

```text
       ESP32-S3 Boots Up & Initializes MicroPython
                           │
    Configure Pins: ADC (GPIO4), DO (GPIO5), PWM (GPIO2 & 6)
                           │
                 Read LDR Sensor Output
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
Calculate LED Duty Cycle                Compare Raw ADC
 (Darker = Brighter)                 with Threshold (2000)
       │                                       │
Apply PWM to GPIO 21                    ┌──────┴──────┐
       │                                ▼             ▼
       │                          Raw > 2000    Raw <= 2000
       │                                │             │
       │                            Rotate to     Rotate to
       │                               90°           0°
       └───────────────────┬──────────────────┘
                           │
              Print Telemetry to Terminal
                           │
               Delay 0.1s & Repeat Loop

```

---

## Deployment Instructions (via `cmd` & `mpremote`)

1. **Upload `main.py` to ESP32-S3:**

```cmd
python -m mpremote connect COM8 cp main.py :main.py

```

2. **Soft Reset Board:**

```cmd
python -m mpremote connect COM8 soft-reset

```

3. **Monitor Real-Time Output:**

```cmd
python -m mpremote connect COM8 repl

```

---

## Verification Matrix

| Test Scenario        | Action                      | Expected Hardware Response                                        | Expected Output Stream              |
| -------------------- | --------------------------- | ----------------------------------------------------------------- | ----------------------------------- |
| **Ambient Light**    | Normal room lighting        | Onboard LED dim or OFF; Servo at $0^\circ$                        | `LDR Raw: <2000                     |
| **Darkness Trigger** | Cover LDR sensor completely | Onboard LED ramps to full brightness; Servo rotates to $90^\circ$ | `LDR Raw: >2000                     |
| **Partial Dark**     | Partially shade sensor      | LED glow increases proportionally                                 | `LED Duty` value increases smoothly |
| **Exit**             | Press `Ctrl + C` in REPL    | Servo homes to $0^\circ$, LED turns OFF cleanly                   | `System stopped cleanly.`           |

---

## Conclusion

The **Light-Controlled Servo Motor and Dynamic LED System** demonstrates real-time closed-loop control using an **ESP32-S3**, **LDR Light Sensor**, **onboard LED**, and a **9g servo motor**. MicroPython's hardware abstraction layer allows seamless management of multi-channel PWM output and ADC inputs concurrently.
