#ifndef FUNC_H
#define FUNC_H

#include <Wire.h>
#include <Arduino.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>

#include "classes.h"


void init_temperature(temperature_averager& t_record, DHT& dht);
#endif