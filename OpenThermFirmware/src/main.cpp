#include <Wire.h>
#include <Arduino.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <BlynkSimpleEsp32.h>
#include "classes.h"
#include "functions.h"
#define DHT_CALIBRATION_VAL -4
#define TEMPERATURE_BUFFER_SIZE 10




// below are relay pins
#define PIN_W2  32
#define PIN_W   33 //heating
#define PIN_G   26 //fan
#define PIN_OB  14
#define PIN_Y2  13
#define PIN_Y   2  //cooling



//virtual pins
#define VPIN_SET_TEMP V0
#define VPIN_ROOM_TEMP 1
#define VPIN_MODE           // 0 off  1 fan   2 cool  3.heat

#define ACTIVE_DELTA_TEMP   4   //if room temperature is outside set_temp +- this delta , then turn on
#define STOP_DELTA_TEMP     2   //if room temperature is within this range, turn off


char auth[] = "b48ac1bb40cd40e4aebf47285366cf4c";

char ssid[] = "Malicious Wifi";
char pass[] = "14285714";



// set the LCD number of columns and rows
int lcdColumns = 16;
int lcdRows = 2;
LiquidCrystal_I2C lcd(0x27, lcdColumns, lcdRows);  
WidgetLCD vlcd(V3);

button_manager button_driver;
//temperature stuff
DHT dht(DHTPin, DHTTYPE); 

interval_protector hvac_interval(1000);//background timer delayed hvac unit control
interval_protector lcd_interval(300);//lcd interval control
interval_protector dht_interval(2000);//temperature interval control
temperature_averager temperature_record;
int room_temperature,set_temperature;
unsigned char hvac_status = 0;
char *hvac_status_str[] = { "Off", "Cool", "Heat"};
BLYNK_CONNECTED() 
{
  Blynk.syncAll();// Request Blynk server to re-send latest values for all pins
}

BLYNK_WRITE(VPIN_SET_TEMP)//update local variable set temperature
{
  set_temperature = param.asInt();
}

void turn_on_heat()
{
  digitalWrite(PIN_Y, LOW);//turn off cooling for protection
  digitalWrite(PIN_W, HIGH);
  digitalWrite(PIN_G, HIGH);
}

void turn_on_cool()
{
  digitalWrite(PIN_W, LOW);//turn off heating for protection
  digitalWrite(PIN_Y, HIGH);
  digitalWrite(PIN_G, HIGH);
}

void turn_off()
{
  digitalWrite(PIN_Y, LOW);
  digitalWrite(PIN_W, LOW);
  digitalWrite(PIN_G, LOW);
}

void setup(){
  pinMode(BUTTON_UP, INPUT);
  pinMode(BUTTON_DOWN, INPUT);
  lcd.init();// initialize LCD
  lcd.backlight();// turn on LCD backlight    
  dht.begin();
  init_temperature(temperature_record, dht);
  Serial.begin(115200);
  Blynk.begin(auth, ssid, pass, IPAddress(45,32,59,202), 8080);// custom server
}




void loop(){

  Blynk.run();
  if(dht_interval.can_exe())
  {
    int tmp_t = dht.readTemperature(true) + DHT_CALIBRATION_VAL;
    if(!isnan(tmp_t) && tmp_t<=150 && tmp_t >= 20)
    {
      room_temperature = temperature_record.push(tmp_t);
    }
    Blynk.virtualWrite(VPIN_ROOM_TEMP, room_temperature);
  }

  
  
  if(lcd_interval.can_exe())
  {
    lcd.clear();
    //physical lcd
    lcd.setCursor(0, 1);
    lcd.print("Set Temp ");
    lcd.print(set_temperature);
    lcd.print("F");
    lcd.setCursor(0, 0);// set cursor to first column, first row
    lcd.print(room_temperature);
    lcd.print("F");

    lcd.setCursor(8, 0);
    lcd.print(hvac_status_str[hvac_status]);

    //virtual lcd on blynk
    vlcd.clear();
    vlcd.print(0,0,room_temperature);
    vlcd.print(6,0,"F");
  }


  if (hvac_interval.can_exe())
  {
    //temperature control logic
    if(abs(set_temperature - room_temperature)<=STOP_DELTA_TEMP)// temperature is within set range
    {
      hvac_status = 0;
      turn_off();
    }

    if(room_temperature > (set_temperature + ACTIVE_DELTA_TEMP)) //room temperature higher than upper bound
    {
      hvac_status = 1;
    
      turn_on_cool();
    }

    if(room_temperature < (set_temperature - ACTIVE_DELTA_TEMP)) //room temperature lower than lower bound
    {
      hvac_status = 2;  
      turn_on_heat();
    }

    unsigned char button_pressed = button_driver.button_scan();
    if(button_pressed >= 0)
    {
      switch(button_pressed)
      {
          case UP_KEY:
              set_temperature ++;
              Blynk.virtualWrite(0, set_temperature);
              break;
          case DOWN_KEY:
              set_temperature --;
              Blynk.virtualWrite(0, set_temperature);
              break;
          
      }
    }

  }
    
  

}