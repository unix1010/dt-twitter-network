# Order: 2
# Generates network data
# i.e. nodes and links
import datetime,json,time
from pymongo import MongoClient
from pprint import pprint

from textblob import TextBlob
import textblob

# retrieve raw statuses
def access_dbs_status():
    client = MongoClient('127.0.0.1', 27017)  # Create a Connection
    db = client.mydt  # Access Database Objects

    data_json = []

    for document in db.streaming.find().batch_size(20):
        data_json.append(document)

    client.close()  # close connection

    return data_json

# retrieve user data
def get_users():
    client = MongoClient('127.0.0.1', 27017)  # Create a Connection
    db = client.mydt  # Access Database Objects

    data_json = []

    for document in db.streaming_user.find().batch_size(20):
        data_json.append(str(document['id']))

    client.close()  # close connection

    return data_json

# generate links
def get_links():

    data_json = access_dbs_status()

    user_list = get_users()
    print(len(user_list))

    data = []

    for item in data_json:
        user_id_str = str(item['user']['id'])

        timestamp = 1000 * int(time.mktime((item['created_at']).timetuple()))

        # if the tweet is a reply and the "@xxx" is also in our list
        # there is a link!
        if item['in_reply_to_user_id_str'] or item['in_reply_to_status_id_str']:
            if item['in_reply_to_user_id_str'] in user_list:
                data.append(
                    [user_id_str
                        ,item['in_reply_to_user_id_str']
                        ,item['in_reply_to_status_id_str']  # can be None
                        ,item['id_str']
                        ,timestamp]
                )
                print([user_id_str
                        ,item['in_reply_to_user_id_str']
                        ,item['in_reply_to_status_id_str']  # can be None
                        ,item['id_str']
                        ,timestamp])


    # pprint(len(data))


    # format data out to front-end
    data_out = []
    for item in data:
        data_out.append(
            {"source": item[1], # target replies to source
             "target": item[0],
             "in_reply_to_status_id_str": item[2],
             "id_str": item[3],
             "created_at": item[4]
             }
        )

    return data_out



# generate nodes
def get_nodes():

    data_json = access_dbs_status()
    # pprint(data_json)

    data = dict()

    for item in data_json:
        user_id_str = str(item['user']['id'])

        sentiment = TextBlob(item['text']).sentiment

        # print(user_id)
        # pprint(data)

        timestamp = 1000 * int(time.mktime((item['created_at']).timetuple()))

        # if user occurs before, add this tweet to that user node's status_object
        # otherwise, create a new node
        if user_id_str in data:
            data[user_id_str]['status_num'] += 1
            data[user_id_str]['first_created_at'].append(timestamp)
            data[user_id_str]['status_object'].append(
                {"status_id_str": item['id_str'],
                          'created_at': timestamp,
                          "sentiment":[sentiment[0],sentiment[1]]
                          # "in_reply_to_status_id_str": item['in_reply_to_status_id_str'],
                          # "in_reply_to_user_id_str": item['in_reply_to_user_id_str']
                          }
            )
        else:
            data.update(
                {user_id_str:
                    {
                     "status_num": 1,
                     "first_created_at": [timestamp],
                     "status_object": [
                         {"status_id_str": item['id_str'],
                          'created_at': timestamp,
                          "sentiment":[sentiment[0],sentiment[1]]
                          # "in_reply_to_status_id_str": item['in_reply_to_status_id_str'],
                          # "in_reply_to_user_id_str": item['in_reply_to_user_id_str']
                          }
                     ]
                     }
                }
            )
        # pprint(data)


    # format data out to front-end
    data_out = []
    for key in data:
        data_out.append(
            {"id": key,
             "status_num": data[key]['status_num'],
             "first_created_at": min(data[key]['first_created_at']),
             "status_object": data[key]['status_object']
             }
        )

    # pprint(data_out)

    return data_out

# main: connect to dbs, process and store data
if __name__ == "__main__":

    data = get_nodes()

    client = MongoClient('127.0.0.1', 27017)  # Create a Connection
    db = client.mydt  # Access Database Objects    # print("writing")
    db.streaming_nodes.insert_many(data)
    print("...done")
    client.close()  # close connection

    # return data_json
