# Geo location

import datetime,json,time
from pymongo import MongoClient
from pprint import pprint
from textblob import TextBlob
import textblob

# retrieve statuses which have geo data
def access_dbs_status():
    client = MongoClient('127.0.0.1', 27017)  # Create a Connection
    db = client.mydt  # Access Database Objects

    data_json = []

    for document in db.streaming.find({"geo": {"$ne": None}}).batch_size(20):
        data_json.append(document)

    client.close()  # close connection

    return data_json

# called by server
def get_geo():

    data_json = access_dbs_status()
    # pprint(data_json)

    data_out = {
        "type": "FeatureCollection",
        "features": []
    }

    for item in data_json:
      if item['geo']:
        sentiment = TextBlob(item['text']).sentiment
        data_out['features'].append(
          {
            "type": "Feature",
            "geometry":
            {"type": item['geo']['type'], 
            # mongoDB inverse geo order
            "coordinates": [item['geo']['coordinates'][1],item['geo']['coordinates'][0]]},
            "properties": {
                "screen_name": item['user']['screen_name'],
                "status_id_str": item['id_str'],
                "text": item['text'],
                "created_at": 1000 * int(time.mktime((item['created_at']).timetuple())),
                "sentiment": {"polarity": sentiment[0], "subjectivity": sentiment[1]}

              }
          }
        )

    return data_out
