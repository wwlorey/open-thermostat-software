#ifndef CLASSES_H
#define CLASSES_H


#define DHTTYPE DHT11 
#define DHTPin  3
#define DHT_CALIBRATION_VAL -4
#define BUTTON_DEBOUNCE_TIME 200
#define BUTTON_UP      5 //sw2
#define BUTTON_DOWN    18 //sw3
#define BUTTON_WIFI    23 //sw5

struct interval_protector
{
    unsigned long last_exe_time, current_time, time_interval;
    interval_protector(unsigned long t)
    {
        last_exe_time = 0;
        time_interval = t;
    }
    bool can_exe()
    {
        current_time = millis(); //milliseconds
        if((current_time - last_exe_time)>time_interval)
        {
            last_exe_time = current_time;
            return true;
        }
        else return false;
    }

};

#define AVG_SIZE 10
struct temperature_averager
{
    short t[AVG_SIZE] = {0,0,0,0,0,0,0,0,0,0};
    unsigned char current_index = 0;
    int sum = 0;
    float push(int t_in)
    {
        sum -= t[current_index];
        sum += t_in;
        t[current_index] = t_in;
        current_index = (current_index + 1)%AVG_SIZE;
        return sum/AVG_SIZE;
    }
};

#define N_BUTTONS 3
#define UP_KEY 0
#define DOWN_KEY 1
#define WIFI_KEY 2
struct button_manager
{
    unsigned long last_press_time=0, current_time;
    char button_pressed = -1;
    unsigned char buttons[N_BUTTONS] = {BUTTON_UP,BUTTON_DOWN,BUTTON_WIFI};
    char button_scan()//return a number for the button pressed
    {
        current_time = millis();
        if((current_time - last_press_time)>BUTTON_DEBOUNCE_TIME)
        {
            for(unsigned char i = 0 ; i < N_BUTTONS;i++)
            {
                if(digitalRead(buttons[i])==LOW)//if a button is actually pressed
                {
                    button_pressed = i;
                    last_press_time = current_time;
                    return button_pressed;
                }
            }
        }
        return button_pressed;
    }
};
#endif

