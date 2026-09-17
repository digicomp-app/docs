# 16-Channel PWM Controller --- PCA9685 Alternative

## 1. Project Overview

This board is designed as an alternative to the **PCA9685 16-channel PWM
controller**.

Instead of using a dedicated PCA9685 IC, the design uses a
**CH32V203C6U6 microcontroller** to generate and control 16 PWM channels
directly.

### Main features

-   16 independent PWM output channels
-   I²C control interface
-   User-selectable I²C address
-   6 solder-jumper address-selection inputs
-   64 possible jumper combinations
-   5 V input supply
-   On-board 3.3 V regulator
-   Output-enable (`OE`) control
-   Power/status LED
-   External connector headers for PWM channels
-   Four mounting holes

------------------------------------------------------------------------

## 2. Main Components

  -----------------------------------------------------------------------
  Reference               Component               Function
  ----------------------- ----------------------- -----------------------
  U1                      CH32V203C6U6            Main microcontroller
                                                  and PWM controller

  U2                      TLV70033_SOT23-5        5 V to 3.3 V voltage
                                                  regulator

  Y1                      8M crystal as labelled  External oscillator
                          in schematic            shown in the schematic

  C1                      15 pF                   Crystal capacitor

  C2                      15 pF                   Crystal capacitor

  C3                      10 µF                   Regulator input
                                                  capacitor

  C4                      10 µF                   Regulator output
                                                  capacitor

  R1                      1 kΩ                    Address ladder

  R20                     2 kΩ                    Address ladder

  R21                     4 kΩ                    Address ladder

  R22                     8 kΩ                    Address ladder

  R23                     16 kΩ                   Address ladder

  R24                     32 kΩ                   Address ladder

  R25                     10 kΩ                   Address ladder
                                                  pull-down

  R2                      10 kΩ                   BOOT0 pull-down

  R27                     10 kΩ                   Power/status LED
                                                  resistor

  R?                      10 kΩ                   OE pull-down shown near
                                                  PB12

  JP1--JP6                Solder jumpers          I²C address selection

  J1                      1×6 connector           Power, I²C and OE
                                                  interface

  J2--J5                  1×4 connectors          PWM channel groups

  J6--J13                 1×4 connectors          PWM channel breakout
                                                  connections

  CN1                     1×2 connector           Power input

  H1--H4                  Mounting holes          Mechanical mounting
  -----------------------------------------------------------------------

> **Note:** The resistor reference numbers are reproduced from the
> supplied schematic. Some designators are visually close together in
> the image, so the final KiCad schematic should be treated as the
> authoritative reference.

------------------------------------------------------------------------

# 3. Power Supply

## 3.1 Input Supply

The board uses a **+5 V input**.

The 5 V input is brought into the board through the power/interface
connections.

The 5 V rail is used for:

-   The board input supply
-   The TLV70033 regulator input
-   The external VCC connection shown on the interface

## 3.2 3.3 V Regulator

U2 is a **TLV70033** low-dropout regulator.

Its connections are:

  U2 pin   Connection
  -------- ------------
  IN       +5 V
  EN       +5 V
  GND      GND
  OUT      +3.3 V

The regulator generates the **+3.3 V rail** required by the
CH32V203C6U6.

### Regulator capacitors

-   C3 = 10 µF from +5 V to GND
-   C4 = 10 µF from +3.3 V to GND

------------------------------------------------------------------------

# 4. Main Microcontroller

## U1 --- CH32V203C6U6

The CH32V203C6U6 is the central controller of the board.

It performs the functions that would normally be handled by the PCA9685
in a PCA9685-based design.

### Main responsibilities

1.  Generate PWM signals.
2.  Control 16 PWM output channels.
3.  Communicate with the host through I²C.
4.  Read the address-selection voltage using an ADC input.
5.  Control the output-enable signal.
6.  Provide programmable PWM frequency and duty cycle.
7.  Store or calculate the active I²C address in firmware.

------------------------------------------------------------------------

# 5. Microcontroller Power Connections

The schematic connects the MCU supply pins to +3.3 V.

### Supply connections

-   `VBAT` → +3.3 V
-   `VDDA` → +3.3 V
-   `VDD_VIO_1` → +3.3 V
-   `VDD_VIO_2` → +3.3 V
-   `VDD_VIO_3` → +3.3 V
-   `VSS` pins → GND

The exposed pad (`EP`) is also shown connected to the supply/ground
network according to the schematic.

------------------------------------------------------------------------

# 6. Oscillator Circuit

The schematic contains:

-   Y1
-   C1 = 15 pF
-   C2 = 15 pF

C1 and C2 are connected from the two oscillator nodes to GND.

The oscillator shown is connected to:

-   `PC14 / OSC32IN`
-   `PC15 / OSC32OUT`

### Important design verification

The symbol for Y1 is labelled **8M** in the supplied schematic, while
the MCU pins are labelled `OSC32IN` and `OSC32OUT`.

This should be checked carefully against the **CH32V203 datasheet**
before PCB fabrication. The schematic also shows `PD0/OSC_IN` and
`PD1/OSC_OUT` as separate pins.

Therefore, verify that the selected crystal frequency and the pins used
for it are correct for the intended oscillator mode.

------------------------------------------------------------------------

# 7. I²C Interface

The I²C interface is implemented using the MCU pins:

  Signal   MCU pin/function
  -------- ------------------
  SCL      PB10
  SDA      PB11

These signals are brought to the external interface connector.

### I²C operation

The host controller communicates with this board using:

-   `SCL` --- I²C clock
-   `SDA` --- I²C data

The CH32V203 firmware receives I²C commands and converts them into PWM
settings.

------------------------------------------------------------------------

# 8. Output Enable --- OE

The `OE` signal is connected to:

-   MCU pin `PB12`
-   External connector J1
-   A 10 kΩ pull-down resistor to GND

The pull-down provides a defined default state when the external OE
signal is not being driven.

The firmware can use `OE` to enable or disable the PWM outputs.

> The exact active-high/active-low behaviour should be defined in
> firmware and verified against the intended PCA9685-compatible
> interface behaviour.

------------------------------------------------------------------------

# 9. PWM Channel Architecture

The board provides **16 PWM channels**.

The channels are divided across four timer peripherals:

-   TIM1: 4 channels
-   TIM2: 4 channels
-   TIM3: 4 channels
-   TIM4: 4 channels

Total:

**4 + 4 + 4 + 4 = 16 PWM outputs**

------------------------------------------------------------------------

# 10. PWM Channel Mapping

## TIM1

  PWM channel   MCU signal
  ------------- ------------
  TIM1_CH1      PA8
  TIM1_CH2      PA9
  TIM1_CH3      PA10
  TIM1_CH4      PA11

These signals are routed to the PWM connector section labelled
`TIM1_CH1` through `TIM1_CH4`.

## TIM2

  PWM channel   MCU signal
  ------------- ------------
  TIM2_CH1      PA0
  TIM2_CH2      PA1
  TIM2_CH3      PA2
  TIM2_CH4      PA3

## TIM3

  PWM channel   MCU signal
  ------------- ------------
  TIM3_CH1      PA6
  TIM3_CH2      PA7
  TIM3_CH3      PB0
  TIM3_CH4      PB1

## TIM4

  PWM channel   MCU signal
  ------------- ------------
  TIM4_CH1      PB6
  TIM4_CH2      PB7
  TIM4_CH3      PB8
  TIM4_CH4      PB9

------------------------------------------------------------------------

# 11. PWM Channel Summary

    Channel Timer      MCU pin
  --------- ---------- ---------
       PWM1 TIM1_CH1   PA8
       PWM2 TIM1_CH2   PA9
       PWM3 TIM1_CH3   PA10
       PWM4 TIM1_CH4   PA11
       PWM5 TIM2_CH1   PA0
       PWM6 TIM2_CH2   PA1
       PWM7 TIM2_CH3   PA2
       PWM8 TIM2_CH4   PA3
       PWM9 TIM3_CH1   PA6
      PWM10 TIM3_CH2   PA7
      PWM11 TIM3_CH3   PB0
      PWM12 TIM3_CH4   PB1
      PWM13 TIM4_CH1   PB6
      PWM14 TIM4_CH2   PB7
      PWM15 TIM4_CH3   PB8
      PWM16 TIM4_CH4   PB9

This provides 16 independent timer-output signals that can be configured
as PWM outputs by firmware.

------------------------------------------------------------------------

# 12. PWM Connector Arrangement

The right side of the schematic contains the external PWM connector
network.

The connectors are arranged in groups corresponding to:

-   TIM1 channels
-   TIM2 channels
-   TIM3 channels
-   TIM4 channels

Each group contains four PWM signals.

The connector arrangement provides access to the 16 generated PWM
outputs for external loads or devices.

------------------------------------------------------------------------

# 13. I²C Address Selection

## Address-selection concept

The board uses an **ADC-based resistor ladder** instead of using
multiple GPIO pins or an additional address-selection IC.

The ladder contains:

-   R1 = 1 kΩ
-   R20 = 2 kΩ
-   R21 = 4 kΩ
-   R22 = 8 kΩ
-   R23 = 16 kΩ
-   R24 = 32 kΩ
-   R25 = 10 kΩ pull-down

Six solder jumpers are provided:

-   JP1 = A0
-   JP2 = A1
-   JP3 = A2
-   JP4 = A3
-   JP5 = A4
-   JP6 = A5

The resulting analog voltage is labelled:

`ADDRESS`

and is connected to:

`PA4 / ADC4`

------------------------------------------------------------------------

# 14. Address Ladder Operation

The resistor chain is connected between +3.3 V and GND.

Each solder jumper is connected across one resistor.

When a jumper is closed, the corresponding resistor is bypassed.

Therefore each jumper has two states:

-   Open
-   Closed

With six independent jumpers:

**2⁶ = 64 possible combinations**

Therefore the hardware can generate up to **64 unique analog voltage
states**, provided that the ADC thresholds are designed with sufficient
voltage separation and resistor tolerances.

------------------------------------------------------------------------

# 15. Address Selection Table Concept

The six jumpers represent six binary selection bits:

  Jumper     Bit
  -------- -----
  JP1         A0
  JP2         A1
  JP3         A2
  JP4         A3
  JP5         A4
  JP6         A5

The firmware measures the voltage on `PA4/ADC4`.

The measured ADC value is then converted into an address-selection code.

Conceptually:

``` text
3.3 V
  |
 R1  1 kΩ
  |---- JP1
 R20  2 kΩ
  |---- JP2
 R21  4 kΩ
  |---- JP3
 R22  8 kΩ
  |---- JP4
 R23 16 kΩ
  |---- JP5
 R24 32 kΩ
  |---- JP6
  |
 ADDRESS ----> PA4 / ADC4
  |
 R25 10 kΩ
  |
 GND
```

The exact ADC-to-I²C-address lookup table must be implemented in
firmware.

------------------------------------------------------------------------

# 16. Address Selection Firmware Concept

At startup, the firmware should:

1.  Configure `PA4` as an ADC input.
2.  Read the `ADDRESS` voltage.
3.  Convert the ADC result to a jumper state.
4.  Determine the selected address.
5.  Configure the I²C peripheral to use that address.
6.  Start normal PWM operation.

A simplified firmware flow is:

``` text
Power ON
   |
   v
Initialize MCU
   |
   v
Initialize ADC
   |
   v
Read ADDRESS voltage
   |
   v
Determine jumper combination
   |
   v
Select I²C address
   |
   v
Initialize I²C
   |
   v
Initialize PWM timers
   |
   v
Wait for I²C commands
   |
   v
Update PWM outputs
```

------------------------------------------------------------------------

# 17. Boot Configuration

The schematic shows a **10 kΩ pull-down** associated with the BOOT0
signal.

This provides a defined default boot state.

The final firmware/programming requirements should be checked against
the CH32V203 boot configuration documentation.

------------------------------------------------------------------------

# 18. Status LED

D2 is used as an indicator LED.

The LED is connected through:

-   D2
-   R27 = 10 kΩ
-   GND

The LED is associated with the VCC/power interface in the supplied
schematic.

Its purpose can be used as a power/status indication depending on the
final PCB connection and firmware.

------------------------------------------------------------------------

# 19. External Interface

J1 is a 1×6 connector intended for the main control interface.

The schematic labels the interface signals as:

-   GND
-   OE
-   SCL
-   SDA
-   VCC
-   an additional connector position

The exact pin numbering should be verified against the final KiCad
netlist before PCB release.

------------------------------------------------------------------------

# 20. Power Connector

CN1 is a 1×2 power connector.

The schematic labels its two connections as:

-   +VCC
-   GND

This connector is intended to provide the board supply.

------------------------------------------------------------------------

# 21. Functional Block Diagram

``` text
                     +----------------------+
                     |      5 V INPUT       |
                     +----------+-----------+
                                |
                                v
                     +----------------------+
                     |     TLV70033 LDO     |
                     |       5 V -> 3.3 V   |
                     +----------+-----------+
                                |
                              +3.3 V
                                |
             +------------------+------------------+
             |                                     |
             v                                     v
    +------------------+                 +-------------------+
    | CH32V203C6U6     |                 | Address Resistor  |
    |                  |<----------------| Ladder            |
    |                  |     ADC4        | JP1 - JP6         |
    |                  |                 +-------------------+
    |                  |
    |  I²C             |
    |  PB10 -> SCL     |
    |  PB11 -> SDA     |
    |                  |
    |  OE / PB12       |
    |                  |
    |  TIM1            |----> PWM1-PWM4
    |  TIM2            |----> PWM5-PWM8
    |  TIM3            |----> PWM9-PWM12
    |  TIM4            |----> PWM13-PWM16
    +------------------+
```

------------------------------------------------------------------------

# 22. PCA9685 Replacement Concept

The original PCA9685 is a dedicated 16-channel PWM controller.

In this design, the CH32V203C6U6 takes over the controller functions.

  Function                 PCA9685-based design    This design
  ------------------------ ----------------------- ---------------------
  PWM generation           PCA9685                 CH32V203 timers
  Number of PWM channels   16                      16
  Host interface           I²C                     I²C
  Address selection        Hardware address pins   ADC resistor ladder
  PWM configuration        PCA9685 registers       MCU firmware
  Output enable            OE                      MCU-controlled OE
  Main controller          PCA9685 IC              CH32V203C6U6
  Supply logic             Device-dependent        3.3 V MCU logic

The major advantage of this architecture is that a separate PCA9685 PWM
IC is not required.

------------------------------------------------------------------------

# 23. Firmware Requirements

The firmware should provide at least the following functions:

### I²C

-   Configure I²C peripheral.
-   Detect/read the hardware-selected address.
-   Receive commands from the host.
-   Process PWM configuration commands.
-   Optionally provide PCA9685-like register compatibility if software
    compatibility is required.

### PWM

For each of the 16 channels:

-   Enable/disable channel.
-   Set PWM frequency.
-   Set duty cycle.
-   Generate the required timer compare values.
-   Update output safely.

### Address detection

-   Read ADC4.
-   Determine which JP1--JP6 combinations are active.
-   Convert the result to an address.
-   Configure the I²C slave address.

### OE

-   Configure PB12.
-   Provide a defined startup state.
-   Enable/disable PWM outputs.

------------------------------------------------------------------------

# 24. Important Electrical Design Checks Before PCB Fabrication

The supplied schematic should be electrically reviewed before moving to
PCB layout.

## 24.1 Crystal connection

The schematic labels Y1 as **8M**, but it is connected to `PC14/OSC32IN`
and `PC15/OSC32OUT`.

Verify this carefully against the CH32V203 oscillator requirements.

The MCU also has:

-   `PD0/OSC_IN`
-   `PD1/OSC_OUT`

If an 8 MHz high-speed external crystal is intended, verify whether it
should instead be connected to the HSE oscillator pins.

## 24.2 SDA connection

In the supplied image, the `SDA` line near J1 visually appears close
to/connected to a `+5V` power symbol.

Verify the KiCad net connectivity.

**SDA must not be hard-connected to +5 V.**

If the +5 V symbol is electrically connected to SDA, the schematic is
incorrect and the connection must be fixed.

## 24.3 I²C pull-up resistors

The supplied schematic does not clearly show dedicated I²C pull-up
resistors on `SCL` and `SDA`.

The final design should include appropriate pull-ups to the intended I²C
logic voltage, unless they are intentionally provided elsewhere on the
system.

## 24.4 MCU decoupling

The schematic does not visibly show individual local decoupling
capacitors for all MCU supply pins.

The final PCB should be checked against the MCU datasheet/reference
design for required bypass capacitors.

## 24.5 ADC address separation

The six-jumper ladder provides 64 theoretical combinations, but 64
combinations do not automatically guarantee 64 reliably distinguishable
ADC readings.

The firmware should use voltage windows rather than exact ADC values.

Resistor tolerance, ADC accuracy, supply variation, temperature and
noise must be considered.

## 24.6 Address conflicts

The firmware should ensure that the 64 selectable addresses are
restricted to valid/usable I²C slave addresses.

Some I²C addresses are reserved or unsuitable for normal device
assignment.

## 24.7 OE default state

The 10 kΩ pull-down on OE gives a defined default logic level.

Verify that this default state matches the intended output behaviour
during:

-   Power-up
-   MCU reset
-   Firmware startup
-   Firmware failure

------------------------------------------------------------------------

# 25. PCB Layout Recommendations

## MCU

-   Place the CH32V203 close to the crystal and its capacitors.
-   Keep oscillator traces short.
-   Keep oscillator traces away from high-current PWM/output traces.
-   Place supply decoupling capacitors close to MCU supply pins.

## Regulator

-   Place C3 close to the regulator input.
-   Place C4 close to the regulator output.
-   Keep the regulator power path short.

## I²C

-   Keep SCL and SDA reasonably short.
-   Avoid unnecessary routing near noisy PWM/output traces.
-   Provide clearly labelled test points if useful.

## ADC address ladder

-   Route the `ADDRESS` node away from PWM signals.
-   Keep the ADC trace short.
-   Avoid placing high-current switching traces next to the ADC node.
-   Place the resistor ladder together as a compact group.

## PWM outputs

-   Clearly label all 16 outputs.
-   Maintain consistent channel ordering.
-   Provide adequate spacing for the intended connectors and loads.

------------------------------------------------------------------------

# 26. Testing Plan

## Power test

Before installing/programming the MCU:

1.  Apply the intended input voltage.
2.  Measure the regulator input.
3.  Measure the +3.3 V rail.
4.  Check for excessive current consumption.
5.  Verify there is no short between +3.3 V and GND.

## MCU test

1.  Program the MCU.
2.  Verify reset operation.
3.  Verify the selected clock source.
4.  Confirm the MCU executes firmware.

## I²C test

1.  Connect a host I²C controller.
2.  Scan the bus.
3.  Confirm the selected address.
4.  Change JP1--JP6.
5.  Power-cycle/reset the board.
6.  Confirm the address changes as expected.

## PWM test

For each channel:

1.  Configure a known frequency.
2.  Configure a known duty cycle.
3.  Observe the signal using an oscilloscope or logic analyzer.
4.  Verify frequency.
5.  Verify duty cycle.
6.  Repeat for all 16 channels.

## OE test

1.  Disable OE.
2.  Verify the expected output state.
3.  Enable OE.
4.  Verify PWM outputs resume correctly.

------------------------------------------------------------------------

# 27. Key Design Parameters

  Parameter                         Target/design value
  --------------------------------- ---------------------
  PWM channels                      16
  PWM timer groups                  4
  PWM channels per timer group      4
  MCU                               CH32V203C6U6
  MCU supply                        3.3 V
  Board input shown                 5 V
  Regulator                         TLV70033
  I²C SCL                           PB10
  I²C SDA                           PB11
  Address ADC                       PA4 / ADC4
  Address jumpers                   6
  Theoretical jumper combinations   64
  OE                                PB12
  Address pull-down                 10 kΩ
  Crystal capacitors shown          15 pF each

------------------------------------------------------------------------

# 28. Overall Signal Flow

``` text
Host Controller
      |
      | I²C
      | SCL / SDA
      v
+-----------------------+
|   CH32V203C6U6 MCU    |
|                       |
|  I²C command decoder  |
|          |            |
|          v            |
|   PWM configuration   |
|          |            |
|   +------+------+-----+------+
|   |      |      |            |
|  TIM1   TIM2   TIM3         TIM4
|   |      |      |            |
+---+------+------+------------+
    |      |      |            |
   4ch    4ch    4ch          4ch
    |      |      |            |
    +------+------+------------+
                   |
               16 PWM outputs

Address selection:
JP1-JP6 -> resistor ladder -> ADC4 -> firmware -> I²C address
```

------------------------------------------------------------------------

# 29. Conclusion

The supplied schematic implements a **16-channel PWM controller using
the CH32V203C6U as the main controller instead of a PCA9685**.

The design combines:

-   16 hardware timer PWM outputs
-   I²C communication
-   ADC-based address selection
-   Six solder jumpers for address configuration
-   5 V to 3.3 V regulation
-   OE control
-   External PWM connectors

The six-jumper resistor ladder provides **64 theoretical hardware
configurations**, which is greater than the commonly required 62
selectable addresses, but the final address mapping must be implemented
carefully in firmware and validated for ADC tolerance and I²C address
validity.

Before PCB fabrication, the **oscillator connection, SDA/+5 V visual
connection, I²C pull-ups, MCU decoupling, and ADC voltage margins**
should be verified in the KiCad electrical schematic and against the
CH32V203 datasheet.
