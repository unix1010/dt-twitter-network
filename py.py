# server!
from flask import Flask,url_for,render_template,request
from flask_jsglue import JSGlue

from pre_code import get_data,status_wall,get_realtime
from pprint import pprint

import json
from bson import json_util
from bson.json_util import dumps

# init
app = Flask(__name__)
jsglue = JSGlue(app)

# index
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/dashboard/filter", methods=["GET", "POST"])
def dashboard_filter():
    global num_min
    if request.method == "POST":
        num_min = int(request.form['filter_val'])

    # print(num_min)
    return json.dumps({"num": num_min}, default=json_util.default)

@app.route("/dashboard/data", methods=["GET", "POST"])
def dashboard_data():
    global num_min
    # if request.method == "POST":
    #     num_min = int(request.form['filter_val'])

    # display nodes who posted at least num_min statuses
    # num_min = 20
    # get nodes and links for network graph
    print(num_min)
    data = get_data.nodes_links(num_min)
    # pprint(data)
    return json.dumps(data, default=json_util.default)

# response to status wall
@app.route("/load_ajax", methods=["GET", "POST"])
def load_ajax():
    if request.method == "POST":
        data = {
            "user_id": request.form['user_id'],
            "status_object": 
            json.loads(request.form['status_object'])
        }
        # pprint(status_wall.get_data(data))
        # return str(request.form)
        return json.dumps(status_wall.get_data(data))

# send sentiment data
@app.route("/dashboard/data/sentiment")
def dashboard_data_sentiment():
    return json.dumps(data, default=json_util.default)

# future work
@app.route("/chart")
def chart():
    return render_template("chart.html")

# geolocated map
@app.route("/geo")
def geo():
    return render_template("geo.html")

# send geo data
@app.route("/geo/data")
def geo_data():
    # pprint(get_realtime.get_geo())
    return json.dumps(get_realtime.get_geo())

# future work
# @app.route("/realtime/data_dbs")
# def realtime_data_dbs():
#     return json.dumps(get_realtime.get_geo())

# main: start server at localhost:8888
if __name__ == "__main__":
    global num_min
    num_min = 20
    app.run(host='127.0.0.1',port=8888,debug=True)


