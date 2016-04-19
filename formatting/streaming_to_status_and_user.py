# Order: 1
# Generates a list of user object from raw data
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import sys, time, json
import json

from collections import Counter
from pymongo import MongoClient
from pprint import pprint


def process_user(user):
    return {"id": user['id']
        , "screen_name": user['screen_name']
        , "followers_count": user['followers_count']
        , "friends_count": user['friends_count']
        , "statuses_count": user['statuses_count']
        , "favourites_count": user['favourites_count']
        , "created_at": user['created_at']
            # 1000 * int(time.mktime(datetime.datetime.strptime(user['created_at']['$date'], "%Y-%m-%dT%H:%M:%S.000Z").timetuple()))
        , "geo_enabled": user['geo_enabled']
        , "location": user['location']
        , "time_zone": user['time_zone']
        , "listed_count": user['listed_count']
        , "name": user['name']
        , "description": user['description']
        , "lang": user['lang']
        , "profile_link_color": user['profile_link_color']
        , "profile_text_color": user['profile_text_color']
        , "profile_sidebar_fill_color": user['profile_sidebar_fill_color']
        , "profile_sidebar_border_color": user['profile_sidebar_border_color']
        , "profile_background_color": user['profile_background_color']
        , "profile_image_url": user['profile_image_url']
        , "related_count": 1
            }


if __name__ == "__main__":
    client = MongoClient('127.0.0.1', 27017)  # Create a Connection
    db = client.mydt

    # a list of "user_id(str): user object"
    user_list = dict()

    for item in db.streaming.find().batch_size(20):

        user_id_str = str(item['user']['id'])

        # meet a user the first time, generate a user object
        # otherwise, count its occurrence
        if user_id_str in user_list:
            user_list[user_id_str]['related_count'] += 1
        else:
            user_list.update(
                {user_id_str:
                     process_user(item['user'])
                 }
            )

            if len(user_list) % 1000 == 0:
                print(len(user_list))

    # data out
    data_out = []
    for key in user_list:
        data_out.append(user_list[key])

    print(len(data_out))

    db.streaming_user.insert_many(data_out)
