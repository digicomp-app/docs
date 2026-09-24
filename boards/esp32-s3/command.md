---
title: Command Guide
---


# ESP32 MicroPython Setup & mpremote / esptool Command Reference

*Compatible with all MicroPython-Supported Digicomp Boards*

## Install Tools

**Install mpremote**

```cmd
pip install mpremote
```

➡️ Installs the tool used to communicate with and control MicroPython boards.

> Note: `py -m ` usually isn't needed before `pip install`. If the plain command above doesn't work (e.g. `pip` isn't recognized), try prefixing it: `py -m pip install mpremote`.

```cmd
py -m mpremote --help
```

➡️ Shows all available `mpremote` commands.

**Install esptool**

```cmd
pip install esptool
```

➡️ Installs Espressif's tool for communicating with ESP32 chips and flashing firmware.

> If the plain command above doesn't work, try prefixing it: `py -m pip install esptool`.

```cmd
py -m esptool version
```

➡️ Shows the installed `esptool` version.

## Connect & Check the ESP32

**Connect Your ESP32**

Plug the ESP32 into USB and find its COM port, for example:

```text
COM6
```

➡️ `COM6` is the Windows serial connection through which your PC talks to the ESP32.

**Check the ESP32**

```cmd
py -m esptool --port COM6 chip-id
```

➡️ Asks the ESP32 which chip it is and verifies that communication is working.

```cmd
py -m esptool --port COM6 flash-id
```

➡️ Reads information about the ESP32's flash memory.

## Erase & Flash MicroPython

**Erase the ESP32**

```cmd
py -m esptool --port COM6 erase-flash
```

➡️ Completely erases the ESP32's flash memory.

⚠️ This deletes the existing firmware/files.

**Flash MicroPython**

Suppose your firmware file is:

```text
ESP32_GENERIC.bin
```

Then:

```cmd
py -m esptool --port COM6 write-flash 0x1000 ESP32_GENERIC.bin
```

➡️ Writes the MicroPython firmware into the ESP32's flash memory.

Note: The correct flash address depends on your board/firmware, so follow the firmware's instructions rather than assuming `0x1000` for every board.

## REPL & Running Code

**Open MicroPython REPL**

```cmd
py -m mpremote connect COM6 repl
```

➡️ Opens an interactive Python console running directly on the ESP32.

You'll see:

```text
>>>
```

Now type:

```python
print("Hello ESP32")
```

➡️ Runs Python code directly on the ESP32.

**Open REPL Again**

```cmd
py -m mpremote connect COM6 repl
```

➡️ Opens the Python console so you can see output and interact with the ESP32.

**REPL Shortcut**

```cmd
py -m mpremote connect COM6 repl
```

➡️ Gives you direct interactive control over the ESP32.

Inside it:

```python
import machine
```

➡️ Loads MicroPython's hardware-control module.

```python
print(machine.freq())
```

➡️ Displays the ESP32 CPU frequency.

```python
import os
print(os.listdir())
```

➡️ Displays files stored on the ESP32.

**Run a PC File Directly**

Suppose you have:

```text
lcd.py
```

Run:

```cmd
py -m mpremote connect COM6 run lcd.py
```

➡️ Sends `lcd.py` from your PC to the ESP32 and executes it without permanently copying it.

This is different from `fs cp`, because `run` is mainly for testing/executing the local file.

**Execute a Single Command**

```cmd
py -m mpremote connect COM6 exec "print('Hello')"
```

➡️ Sends that Python command to the ESP32 and executes it.

For example:

```cmd
py -m mpremote connect COM6 exec "import os; print(os.listdir())"
```

➡️ Imports the filesystem module and prints the ESP32's files.

## Files on the ESP32

**Check ESP32 Files**

```cmd
py -m mpremote connect COM6 fs ls
```

➡️ Lists the files currently stored in the ESP32's MicroPython filesystem.

For example:

```text
boot.py
main.py
```

**Create main.py**

On your computer create:

```text
main.py
```

Put:

```python
print("Hello from ESP32")
```

➡️ This is the program MicroPython normally executes automatically after boot.

**Upload main.py**

```cmd
py -m mpremote connect COM6 fs cp main.py :main.py
```

➡️ Copies `main.py` from your PC to the ESP32.

Notice:

```text
main.py → :main.py
PC          ESP32
```

The `:` means the destination is the ESP32 filesystem.

**Copy a Library**

```cmd
py -m mpremote connect COM6 fs cp lcd.py :lcd.py
```

➡️ Copies your LCD library from the PC onto the ESP32.

Then in Python:

```python
import lcd
```

➡️ Loads the `lcd.py` library from the ESP32.

**Copy a Library into /lib**

```cmd
py -m mpremote connect COM6 fs cp lcd.py :lib/lcd.py
```

➡️ Places the library inside the ESP32's standard library directory.

Your code can still use:

```python
import lcd
```

**Create/Use Directories**

```cmd
py -m mpremote connect COM6 fs ls
```

➡️ Lets you see directories such as `lib/`.

For example:

```text
/
├── boot.py
├── main.py
└── lib/
    └── lcd.py
```

**Delete a File**

```cmd
py -m mpremote connect COM6 fs rm lcd.py
```

➡️ Deletes `lcd.py` from the ESP32.

**Copy a File Back to Your PC**

```cmd
py -m mpremote connect COM6 fs cp :main.py main_backup.py
```

➡️ Copies `main.py` from the ESP32 to your computer as `main_backup.py`.

Again:

```text
:main.py → main_backup.py
 ESP32          PC
```

## Reset the ESP32

**Reset the ESP32**

```cmd
py -m mpremote connect COM6 reset
```

➡️ Restarts the ESP32, causing MicroPython to boot again.

Because `main.py` exists, MicroPython executes it automatically.

**Soft Reset**

```cmd
py -m mpremote connect COM6 soft-reset
```

➡️ Restarts the MicroPython interpreter without doing a full hardware reset.

**Hard Reset**

```cmd
py -m mpremote connect COM6 reset
```

➡️ Resets/reboots the ESP32 hardware.

## Packages (pip vs mip)

**Install a MicroPython Package**

```cmd
py -m mpremote connect COM6 mip install PACKAGE_NAME
```

➡️ Downloads and installs a MicroPython-compatible package onto the ESP32.

For example:

```cmd
py -m mpremote connect COM6 mip install umqtt.simple
```

➡️ Installs the MQTT library if that package is available through MicroPython's package system.

**pip vs mip**

**pip:**

```cmd
py -m pip install requests
```

➡️ Installs a package on your Windows PC.

**mip:**

```cmd
py -m mpremote connect COM6 mip install PACKAGE_NAME
```

➡️ Installs a MicroPython-compatible package on your ESP32.

Think: `pip` = PC Python, `mip` = MicroPython device.

---
