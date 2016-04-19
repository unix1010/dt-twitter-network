# Prepare data for the "status wall"
import datetime,json,time
from pymongo import MongoClient
from pprint import pprint
from textblob import TextBlob
import textblob


# DATA FORMATS ARE LISTED BELOW
# $POST format
# {'user_id': '1300865438',
# 'status_object': {
#   [{'created_at': 1441819567000, 'status_id_str': '641678990315384832'},
#    {'created_at': 1441817790000, 'status_id_str': '641671534981976064'},
#    {'created_at': 1441813832000, 'status_id_str': '641654935361159168'},
#    {'created_at': 1441813907000, 'status_id_str': '641655251221614592'}]
#   }
# }

# dbs format
# data = {
#   'user_object': 
#     { "_id" : ObjectId("56c0f36fa8d79801be0a591e"),
#     "geo_enabled" : true,
#     "description" : "mydescription",
#     "followers_count" : 84,
#     "id" : 310198272,
#     "profile_image_url" : "http://pbs.twimg.com/profile_images/669483996649246720/8UQmO3su_normal.jpg",
#     "lang" : "fr",
#     "location" : "Rennes",
#     "profile_sidebar_border_color" : "C0DEED",
#     "statuses_count" : 5106,
#     "listed_count" : 7,
#     "screen_name" : "Pierre_Alcon",
#     "time_zone" : "Paris",
#     "profile_link_color" : "0084B4",
#     "profile_sidebar_fill_color" : "DDEEF6",
#     "profile_text_color" : "333333",
#     "created_at" : "2011-06-03 10:38:48",
#     "profile_background_color" : "C0DEED",
#     "favourites_count" : 296,
#     "friends_count" : 20,
#     "name" : "Pierre" 
#     },
#   'status_object':[
#     { "_id" : ObjectId("56ce7db3a8d798443f100108"), 
#       "retweeted" : false, 
#       "created_at" : ISODate("2015-06-10T06:39:30Z"), 
#       "retweet_count" : 0, 
#       "user_id" : 1286102160, 
#       "text" : "fooooooooo", 
#       "in_reply_to_user_id_str" : null,
#       "id_str" : "608523867116609536",
#       "geo" : null,
#       "in_reply_to_status_id_str" : null
#     }
#   ]
# }

# data out
#     {"id": 213040890,
#      "status_num": 10,
#      "first_created_at": {'$date': '2015-06-09T05:27:55.000Z'},
#      "status_object": [
#          {"status_id_str": '608143467202637824',
#           'created_at': {'$date': '2015-06-09T05:27:55.000Z'},
#           "in_reply_to_status_id_str": None,
#           "in_reply_to_user_id_str": None},
#
#          {"status_id_str": '608143467202637824',
#           'created_at': {'$date': '2015-06-09T05:27:55.000Z'},
#           "in_reply_to_status_id_str": None,
#           "in_reply_to_user_id_str": None}
#         ]
#      }
# ]


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
            }


def process_status(status, lang):
    text = ""

    # translate
    if lang == 'en':
        text = status['text']
    else:
        blob = TextBlob(status['text'])
        try:
            text = str(blob.translate())
        except textblob.exceptions.NotTranslated:
            text = status['text']

    # sentiment analysis
    sentiment = TextBlob(text).sentiment

    return {
          "created_at": 1000 * int(time.mktime((status['created_at']).timetuple()))
        , "id_str": status['id_str']
        , "text": text
        , "sentiment": {"polarity": sentiment[0], "subjectivity": sentiment[1]}
        , "retweet_count": status['retweet_count']
        , "in_reply_to_status_id_str": status['in_reply_to_status_id_str']
        , "geo": status['geo']
        , "retweeted": status['retweeted']
        , "in_reply_to_user_id_str": status['in_reply_to_user_id_str']
            }

# status_object -> this func -> more detailed status_object
def access_dbs_many_status(status_object, lang):
    client = MongoClient('127.0.0.1', 27017)  # Create a Connection
    db = client.mydt  # Access Database Objects

    data_json = []

    for status in status_object:
      d = db.streaming.find_one({"id_str": status['status_id_str']})
      data_json.append(
        process_status(d, lang)
      )

    client.close()  # close connection

    return data_json

# user_id -> this func -> user object
def access_dbs_user(user_id):
  # Note: 
  # user_id: str
  # id: int
    client = MongoClient('127.0.0.1', 27017)  # Create a Connection
    db = client.mydt  # Access Database Objects

    data = db.streaming_user.find_one({"id": user_id})
    data = process_user(data)
    client.close()  # close connection

    return data

# API :) called by server
def get_data(input):

  user_object = access_dbs_user(int(input['user_id']))
  status_object = access_dbs_many_status(input['status_object'], user_object['lang'])
  # return access_dbs_user(int(input['user_id']))
  return {
  "user_object": user_object,
  "status_object": status_object,
  "test": 1
  }

# pre-store data - used for node sentiment colour
def get_sentiment_all():

    # fetch user id and str
    client = MongoClient('127.0.0.1', 27017)  # Create a Connection
    db = client.mydt  # Access Database Objects

    data = []
    for document in db.streaming_nodes.find().batch_size(20):
        data.append({
            "user_id": str(document['id']),
            "sentiment": document['status_object']
            })

    # add sentiment data to each node
    for node in data:
        for item in node['sentiment']:
            d = db.streaming.find_one({"id_str": item['status_id_str']})
            # pprint(d)
            sentiment = TextBlob(d['text']).sentiment
            item.update({"sentiment":[sentiment[0],sentiment[1]]})

    client.close()  # close connection

    pprint(data)
    # return data

# main: run this only when "> Python 3 status_wall.py", otherwise it won't run
if __name__ == "__main__":
    get_sentiment_all()
