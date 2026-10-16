---
title: ESP32-C3 Weather Station
---

# ESP32-C3 IoT Weather Station

This project connects an *Digicomp ESP32-C3* Dev Board to Wi-Fi to fetch live weather of city using OpenWeatherMap REST API.

## Hardware

| Item | Details |
| :--- | :--- |
| Board | *Digicomp ESP32-C3 Dev Board* |
| Microcontroller | ESP32-C3 (RISC-V) |
| Programming Language | C++ (Arduino) |
| Data Source | OpenWeatherMap API |

## Wi-Fi & HTTP Code Snippets

Save your network credentials and include the necessary libraries:

```
#include <WiFi.h>
#include <HTTPClient.h>
#include<Arduino_JSON.h>

const char* ssid = " ";
const char* password = " ";
```


1. Connecting to Wi-Fi:
The board connects to your wireless network during setup:
```
WiFi.begin(ssid, password);
Serial.print("Connecting to Wi-Fi");

while (WiFi.status() != WL_CONNECTED) {
  delay(500);
  Serial.print(".");
}
```
2. HTTP Request Function:
A helper function is used to handle HTTP GET requests to the weather server:

```
String httpGETRequest(const char* serverName) {
  WiFiClient client;
  HTTPClient http;

  http.begin(client, serverName);
  int httpResponseCode = http.GET();

  String payload = "";
  if (httpResponseCode > 0) {
    payload = http.getString();
  } else {
    payload = "Error code: " + String(httpResponseCode);
  }
  
  http.end();
  return payload;
}
```
3. Call the function
```
void loop() {
  // Check weather at regular time intervals
  if ((millis() - lastTime) > timerDelay) {
    if (WiFi.status() == WL_CONNECTED) {
      String serverPath = "API URL here" ;

      String jsonBuffer = httpGETRequest(serverPath.c_str());
    }
  }
}
```

## Uploading to the Board:
1.Select ESP32C3 Dev Module under Tools > Board.

2.Set USB CDC On Boot to Enabled.

3.Connect your ESP32-C3 board to your PC via USB.

4.Select the correct COM Port.

5.Click the Upload button.

6.Open the Serial Monitor at 115200 baud and press the RST button.

## Final output: 

```
Connecting to Wi-Fi.....
Connected successfully!
IP Address: 192.168.1.15

--- Weather Update ---
City: my city
Temperature: 29.4 °C
Humidity: 78 %
```
 



