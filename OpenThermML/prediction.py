#!/usr/local/bin/python3

from config import *
from copy import deepcopy
import datetime
from util import *


class Prediction:
    """Makes temperature set-point predictions based on user location history and current
    user location.
    """

    def __init__(self):
        self.predictions = [
            [0.0 for _ in range(DAY_LENGTH)] for _ in range(NUM_DAYS)
        ]

        self.prediction_counts = [
            [0 for _ in range(DAY_LENGTH)] for _ in range(NUM_DAYS)
        ]

    def backup(self):
        """Writes the current prediction state to file."""
        with open(BACKUP_FILE_NAME, 'w') as backup:
            write_2D_list_to_file(
                backup, self.predictions, 'predictions'
            )

            write_2D_list_to_file(
                backup, self.prediction_counts, 'prediction_counts'
            )

    def load_backup(self):
        """Attempts to load the predictions & counts from `backup` module."""
        try:
            from backup import predictions, prediction_counts
            self.predictions = deepcopy(predictions)
            self.prediction_counts = deepcopy(prediction_counts)

        except ImportError:
            print('Error:\tFailed to load backup :(')

    def get_datetime_data(self):
        """Returns a tuple(day index, day timeslice index, next day index,
        next day timeslice index) based on the current date/time.
        """
        today = datetime.datetime.today()
        day_index = today.weekday()
        day_timeslice_index = today.hour * 2 + (1 if today.minute >= 30 else 0)
        next_day_timeslice_index = (day_timeslice_index + 1) % DAY_LENGTH

        if next_day_timeslice_index == 0:
            next_day_index = (day_index + 1) % NUM_DAYS

        else:
            next_day_index = day_index

        return (day_index, day_timeslice_index, next_day_index, next_day_timeslice_index)

    def update_prediction(self, is_home):
        """Updates self.predictions at current time of day with is_home."""
        day_index, day_timeslice_index, _, _ = self.get_datetime_data()

        try:
            self.prediction_counts[day_index][day_timeslice_index] += 1
            self.predictions[day_index][day_timeslice_index] = (
                self.predictions[day_index][day_timeslice_index] +
                (1 if is_home else 0)
            ) / self.prediction_counts[day_index][day_timeslice_index]

        except:
            print('Error:\tFailed to update prediction :(')

    def get_prediction(self, is_home):
        """Returns the predicted optimal set-point temperature for the home and
        updates the predictions accordingly.
        """
        self.update_prediction(is_home)

        if is_home:
            # When the user is home, disregard prediction
            return PRESENT_SET_POINT

        _, _, next_day_index, next_day_timeslice_index = self.get_datetime_data()

        try:
            return PRESENT_SET_POINT if self.predictions[next_day_index][next_day_timeslice_index] > PRESENT_THRESHOLD else ABSENT_SET_POINT

        except:
            # Something went wrong, assume the owner is home
            print('Error:\tFailed to get prediction :(')
            return PRESENT_SET_POINT
