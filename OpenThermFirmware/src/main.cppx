#include <Arduino.h>

/**
 * Blink
 *
 * Turns on an LED on for one second,
 * then off for one second, repeatedly.
 */
#include "Arduino.h"

#define LED_BUILTIN 2
#define TOUTCH_PIN T6 // ESP32 Pin D14
#define RELAY_PIN 25
int touch_value = 100;
void setup()
{
  // initialize LED digital pin as an output.
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);
}

void loop()
{
  touch_value = touchRead(TOUTCH_PIN);
  Serial.println(touch_value);  // get value using T0 
  if (touch_value < 50) // Touching
  {
    digitalWrite (RELAY_PIN, LOW);
    digitalWrite (LED_BUILTIN, HIGH);
  }
  else
  {
    digitalWrite (RELAY_PIN, HIGH);
    digitalWrite (LED_BUILTIN, LOW);
  }
  delay(200);
}