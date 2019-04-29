#include "functions.h"

void init_temperature(temperature_averager& t_record, DHT& dht)
{
    while(true)
    {
        int tmp_t = dht.readTemperature(true) + DHT_CALIBRATION_VAL;
        if(!isnan(tmp_t) && tmp_t<=150 && tmp_t >= 20)
        {
            for(int i=0;i<10;i++)t_record.push(tmp_t);
            return;
        }
        delay(1500);

    }
    
}
