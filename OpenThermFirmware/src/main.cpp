#include <Wire.h>
#include <Arduino.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <BlynkSimpleEsp32.h>

#define DHTTYPE DHT11 
#define DHTPin 3 //temperature sensor pin

// below are relay pins
#define PIN_W2  32
#define PIN_W   33 //heating
#define PIN_G   26 //fan
#define PIN_OB  14
#define PIN_Y2  13
#define PIN_Y   2  //cooling

//virtual pins
#define VPIN_SET_TEMP V0
#define VPIN_ENV_TEMP
#define VPIN_MODE           // 0 off  1 fan   2 cool  3.heat

#define ACTIVE_DELTA_TEMP   3   //if room temperature is outside set_temp +- this delta , then turn on
#define STOP_DELTA_TEMP     1   //if room temperature is within this range, turn off


char auth[] = "b48ac1bb40cd40e4aebf47285366cf4c";

char ssid[] = "Malicious Wifi";
char pass[] = "14285714";

BLYNK_CONNECTED() 
{
  // Request Blynk server to re-send latest values for all pins
  Blynk.syncAll();
}

// set the LCD number of columns and rows
int lcdColumns = 16;
int lcdRows = 2;
LiquidCrystal_I2C lcd(0x27, lcdColumns, lcdRows);  
WidgetLCD vlcd(V3);

//temperature stuff
DHT dht(DHTPin, DHTTYPE); 
float t_0 = 0,t_1=0; 
int t_set;

//update local variable set temperature
BLYNK_WRITE(VPIN_SET_TEMP)
{
  t_set = param.asInt();
}

//background timer delayed hvac unit control variables
unsigned long last_hvac_action_time = 0;
const long hvac_action_interval = 1000;

//background timer delayed lcd refresh variables, not yet implemented
unsigned long last_lcd_refresh_time = 0;
const long lcd_refresh_interval = 200;


void setup(){
  // initialize LCD
  lcd.init();
  // turn on LCD backlight                      
  lcd.backlight();

  dht.begin();

  Serial.begin(115200);
  Blynk.begin(auth, ssid, pass, IPAddress(45,32,59,202), 8080);// custom server
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
  digitalWrite(PIN_G, HIGH);
}

void loop(){

  Blynk.run();
  t_0 = dht.readTemperature(true);
  
  
  // if(t_set != V0)
  // {

    lcd.setCursor(0, 1);
    lcd.print("Set Temp ");
    lcd.print(t_set);
    lcd.print("F");
    delay(100);
  // }

  //refresh lcd
  if(t_1 != t_0)
  {
    t_1 = t_0;
    // set cursor to first column, first row
    lcd.setCursor(0, 0);
    // print message
    //lcd.clear();
    lcd.print(t_1);
    lcd.print("F");
    vlcd.clear();
    vlcd.print(0,0,t_1);
    vlcd.print(6,0,"F");
    delay(100);
  }
  delay(100);
  
  unsigned long currentMillis = millis();
  if (currentMillis - last_hvac_action_time >= hvac_action_interval)
  {
    last_hvac_action_time = currentMillis;
    //temperature control logic
    if(abs(t_set - t_0)<=STOP_DELTA_TEMP)// temperature is within set range
    {
      lcd.setCursor(8, 0);
      lcd.print("Off ");
      turn_off();
    }

    if(t_0 > (t_set + ACTIVE_DELTA_TEMP)) //room temperature higher than upper bound
    {
      lcd.setCursor(8, 0);
      lcd.print("Cool");
    
      turn_on_cool();
    }

    if(t_0 < (t_set - ACTIVE_DELTA_TEMP)) //room temperature lower than lower bound
    {
      lcd.setCursor(8, 0);
      lcd.print("heat");
    
      turn_on_heat();
    }
  }
    
  

}