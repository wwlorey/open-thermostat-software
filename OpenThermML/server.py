#!/usr/bin/env python
# Note: this module is written in Python 2 because that's what the Blynk docs use

from _secrets import *
from prediction import Prediction
from urllib2 import Request, urlopen
import time


# Constants
SET_TEMP_PIN = 'V1'  # Set temperature virtual pin
HEADERS = {
    'Content-Type': 'application/json'
}


def update_temperature(temperature):
    """Sends the given temperature to the server."""
    values = '[ "' + str(temperature) + '" ]'

    request_str = 'http://' + server_addr + ':' + port + \
        '/' + auth_token + '/update/' + SET_TEMP_PIN

    request = Request(request_str, data=values, headers=HEADERS)
    request.get_method = lambda: 'PUT'

    print 'Temperature', str(temperature), 'sent to', request_str

    response_body = urlopen(request).read()
    print response_body + '\n'


prediction = Prediction()
prediction.load_backup()

while True:
    # Get the predicted temperature
    set_point = prediction.get_prediction(False)

    # Tell the server about it
    update_temperature(set_point)

    # Backup the model
    prediction.backup()

    # Sleep for 30min
    print 'Sleeping for 30min...'
    time.sleep(60 * 30)
