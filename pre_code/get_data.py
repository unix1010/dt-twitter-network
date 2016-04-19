# Get graph data: nodes and links (pre stored)

import datetime,json,time
from pymongo import MongoClient
from pprint import pprint

# retrieve links from dbs
def get_links(id_list):

    client = MongoClient('127.0.0.1', 27017)  # Create a Connection
    db = client.mydt  # Access Database Objects

    data_json = []

    for document in db.streaming_links.find().batch_size(20):
        if document['source'] in id_list and document['target'] in id_list:
            data_json.append(document)

    client.close()  # close connection

    return data_json

# retrieve nodes from dbs
def get_nodes(status_num_min):

    client = MongoClient('127.0.0.1', 27017)  # Create a Connection
    db = client.mydt  # Access Database Objects

    data_json = []
    id_list = []

    for document in db.streaming_nodes.find({"status_num":{"$gt": status_num_min}}).batch_size(20):
        data_json.append(document)
        id_list.append(document['id'])

    client.close()  # close connection

    return {"data_json": data_json, "id_list": id_list}

# called by server: return {"nodes": nodes from dbs, "links": links from dbs}
def nodes_links(status_num_min):
    data = get_nodes(status_num_min)
    nodes = data['data_json']
    links = get_links(data['id_list'])
    return {"nodes": nodes, "links": links}

# main: run this only when "> Python 3 get_data.py", otherwise it won't run
if __name__ == "__main__":
    for i in range(0,10):
        data = get_nodes(i)
        nodes = data['data_json']
        links = get_links(data['id_list'])
        print("%d\t%d" % (len(nodes),len(links)))