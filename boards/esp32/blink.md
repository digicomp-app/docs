# Introduction

The Blink project uses Digicomp ESP32 development board programmed through Arduino IDE to turn an LED ON and OFF repeatedly using digital GPIO control.

# Objective

To program the ESP32 to blink an LED connected to GPIO 15 using digitalWrite() and delay() functions.

# Requirements

## Hardware
| Item | Details |
| --- | --- |
| Board | **Digicomp ESP32 Dev Board** |
| Microcontroller | ESP32 |
| Programming language | MicroPython |
| On-board LED | GPIO 15 |

## Software

Arduino IDE 2.3.10

ESP32 board support package

Digicomp.app for preparing or publishing the project documentation
#  Program Code

```
void setup() {
  // Configure GPIO 15 as an output
  pinMode(15, OUTPUT);
}

void loop() {
  // Turn the LED ON
  digitalWrite(15, HIGH);
  delay(2000);

  // Turn the LED OFF
  digitalWrite(15, LOW);
  delay(100);
}
```

#  Explanation of the Code

## setup() Function

The setup() function executes once when the ESP32 starts or resets.

pinMode(15, OUTPUT);

This statement configures GPIO 15 as an output pin so that the ESP32 can control an external LED or another compatible output device.

## loop() Function

The loop() function executes continuously after setup() finishes.

Turning the LED ON

```
digitalWrite(15, HIGH);
delay(2000);
```

The GPIO 15 output is set to HIGH. The program then waits for 2,000 milliseconds (2 seconds).

Turning the LED OFF

```
digitalWrite(15, LOW);
delay(100);
```

The GPIO 15 output is set to LOW. The program then waits for 100 milliseconds (0.1 seconds).

The loop repeats continuously, producing a blinking effect.

# Expected Output

After successful compilation and uploading, the LED connected to GPIO 15 should repeatedly turn ON and OFF.

| LED state | GPIO Output | Duration |
| --- | --- | --- |
| ON | HIGH|2 seconds |
| OFF|LOW|0.1 seconds |
| Complete Cycle|HIGH + LOW|2.1 seconds |

Output: The LED blinks continuously, remaining ON for 2 seconds and OFF for 0.1 seconds.

# Result

The Blink LED program is successfully implemented on the ESP32 development board. The experiment demonstrates digital output control using pinMode(), digitalWrite(), and delay().
# Conclusion

The experiment demonstrates the basic working principle of an ESP32-based embedded system. By controlling GPIO 15 through software, an LED can be switched between ON and OFF states at specified time intervals. This project provides a foundation for more advanced applications involving sensors, actuators, automation, and Internet of Things (IoT) devices.

