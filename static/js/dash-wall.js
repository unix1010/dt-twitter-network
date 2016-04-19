// helper
function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

(function($) {
    $('#close-right').hide();
    $.prototype.sidebar = function(options) {

        var self = this;

        // Defaults setting
        // extend(): Merge the contents of options together into the first {}.
        var settings = $.extend({
            // Animation speed
            speed: 200,
            // Side: left|right|top|bottom
            side: "left",
            // Is closed
            isClosed: false,
            // Should I close the sidebar?
            close: true
        }, options);


        // open
        // $([jQuery selector]).trigger("sidebar:open");
        self.on("sidebar:open", function(ev, data) {
            var properties = {};
            properties[settings.side] = 0;
            settings.isClosed = null;
            self.stop().animate(properties, $.extend({}, settings, data).speed, function() {
                settings.isClosed = false;
                self.trigger("sidebar:opened");
            });
        });


        // close
        self.on("sidebar:close", function(ev, data) {
            var properties = {};
            if (settings.side === "left" || settings.side === "right") {
                properties[settings.side] = -self.outerWidth();
            } else {
                properties[settings.side] = -self.outerHeight();
            }
            settings.isClosed = null;
            self.stop().animate(properties, $.extend({}, settings, data).speed, function() {
                settings.isClosed = true;
                self.trigger("sidebar:closed");
            });
        });

        // toggle
        self.on("sidebar:toggle", function(ev, data) {
            if (settings.isClosed) {
                self.trigger("sidebar:open", data);
            } else {
                self.trigger("sidebar:close", data);
            }
        });

        function closeWithNoAnimation() {
            self.trigger("sidebar:close", [{
                speed: 0
            }]);
        }

        // Close the sidebar
        if (!settings.isClosed && settings.close) {
            closeWithNoAnimation();
        }

        $(window).on("resize", function () {
            if (!settings.isClosed) { return; }
            closeWithNoAnimation();
        });

        self.data("sidebar", settings);

        return self;
    };
})(jQuery);


$(document).ready(function () {
    // say: control "right" side
    cSide = "right";
    $(".sidebar." + cSide).sidebar({side: cSide});

    var status_object;
    var user_id;

    // Click handlers
    $(document).on("click", ".gnode", function() {
        status_object = $(this).prop("__data__").status_object;
        user_id = $(this).prop("__data__").id;
        var action="open";
        var side="right";
        var object_div = ".sidebar." + side;
        $(object_div).trigger("sidebar:" + action);
        return false;
    });

    // close button
    $(".close-sidebar").on("click", function () {
        var action="close";
        var side="right";
        var object_div = ".sidebar." + side;
        $(object_div).trigger("sidebar:" + action);
        return false;
    });

    var object_div = ".sidebar.right";
    //count = 0;

    /* Object { in_reply_to_user_id_str: null,
     *          created_at: 1401726666000,
     *          status_id_str: "473517173021765632",
     *          in_reply_to_status_id_str: null }
     */
    $(object_div).on("sidebar:opened", function () {
        // clear previous elements
        $(".added").remove();
        $('#close-right').show();

        // request server to send response data
        $.post('/load_ajax',
            { "user_id": user_id,
                "status_object": JSON.stringify(status_object)
            }, function(data){
                // reveice processed data from server-side
                var status_object = JSON.parse(data)['status_object'];
                var user_object = JSON.parse(data)['user_object'];

                var elements="";

                elements += "<div class='user'>" +
                                "<img class='user-pic' src='" +
                                user_object.profile_image_url +
                                "'> </img>" +
                                "<p style='margin: 0'>" +
                                user_object.screen_name +
                                "</p>" +
                                "<div class='user-1'> " +
                                    "<ul>" +
                                    "<li><span>Tweets</span><span>" + user_object.statuses_count + "</span></li>" +
                                    "<li><span>Following</span><span>" + user_object.friends_count + "</span></li>" +
                                    "<li><span>Followers</span><span>" + user_object.followers_count + "</span></li>" +
                                    "</ul>" +
                                "</div>" +
                                "<div class='user-2'> " +
                                    "<ul>" +
                                    //"Lang: " + user_object.lang +
                                    "<li style='width: 80px;'><span class='lang-xs lang-lbl-en' lang=" + user_object.lang + "></span></li>" +
                                    "<li> <span style='color: #31708f;' class='glyphicon glyphicon-map-marker' aria-hidden='true'></span>" + user_object.location + "</li>" +
                                    "</ul>" +
                                    "Joined on " + user_object.created_at +
                                 "</div>" +

                            "</div>";

                // process each status and display
                $.each(status_object, function(index, value) {
                    // set div height
                    //var per_height = ($(object_div).height() - Number($(object_div).css("padding-top").replace('px', ''))) / num_of_status_per_page;

                    //console.log(value);

                    // convert date
                    var mydate = new Date(value.created_at);
                    var year = mydate.getFullYear();
                    var month = zeroPad(mydate.getMonth()+1,2);
                    var date = zeroPad( mydate.getDate(),2);
                    var hour = zeroPad(mydate.getHours(),2);
                    var min = zeroPad(mydate.getMinutes(),2);
                    var sec = zeroPad(mydate.getSeconds(),2);
                    var datestr =  year +'-'+ month +'-'+ date +' '+ hour +':'+ min +':'+ sec;
                    //
                    var screen_name = user_object.screen_name;
                    var text = value.text;
                    var in_reply_to_status_id_str = value.in_reply_to_status_id_str;
                    var in_reply_to_user_id_str = value.in_reply_to_user_id_str;
                    var retweet_count = value.retweet_count;
                    var sentiment_polarity = value.sentiment.polarity.toFixed(2);
                    var sentiment_subjectivity = value.sentiment.subjectivity.toFixed(2);
                    var reply_color;
                    var retweet_color;


                    // reply and retweet icon colour
                    if (in_reply_to_status_id_str == null && in_reply_to_user_id_str == null){
                        reply_color = "rgba(255, 255, 255," + 0.2 + ")";
                    } else {
                        reply_color = "rgba(255, 255, 255," + 0.8 + ")";
                    }
                    if (retweet_count == 0){
                        retweet_color = "rgba(255, 255, 255," + 0.2 + ")";
                    } else {
                        retweet_color = "rgba(255, 255, 255," + 0.8 + ")";
                    }

                    // show statuses posted before the given date
                    if( value.created_at/1000 <= Number($("#range").val()) ) {
                        //console.log(d[3]/1000 > Number($("#range").val()))
                        //elements += "<div class='panel' style='height: " + per_height + "px;'>["+datestr+"]<br />@"+screen_name+":" + text + "</div>\n";
                        elements += "<div class='panel'>" +
                            "<p>" + "@"+screen_name+": " + text + "</p>" +
                            "<div class='status_card'>" +
                                "<span style='margin-right: 10px'>" +
                                    "<svg style='fill: "+reply_color+";' class='twitter-icon' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 65 72'>" +
                                    "<path d='M41 31h-9V19c0-1.14-.647-2.183-1.668-2.688-1.022-.507-2.243-.39-3.15.302l-21 16C5.438 33.18 5 34.064 5 35s.437 1.82 1.182 2.387l21 16c.533.405 1.174.613 1.82.613.453 0 .908-.103 1.33-.312C31.354 53.183 32 52.14 32 51V39h9c5.514 0 10 4.486 10 10 0 2.21 1.79 4 4 4s4-1.79 4-4c0-9.925-8.075-18-18-18z'/>" +
                                    "</svg>" +
                                "</span>" +
                                "<span style='color: "+ retweet_color +";'>" +
                                    "<svg style='fill:"+retweet_color+";' class='twitter-icon'xmlns='http://www.w3.org/2000/svg' viewBox='0 0 65 72'>" +
                                    "<path d='M70.676 36.644C70.166 35.636 69.13 35 68 35h-7V19c0-2.21-1.79-4-4-4H34c-2.21 0-4 1.79-4 4s1.79 4 4 4h18c.552 0 .998.446 1 .998V35h-7c-1.13 0-2.165.636-2.676 1.644-.51 1.01-.412 2.22.257 3.13l11 15C55.148 55.545 56.046 56 57 56s1.855-.455 2.42-1.226l11-15c.668-.912.767-2.122.256-3.13zM40 48H22c-.54 0-.97-.427-.992-.96L21 36h7c1.13 0 2.166-.636 2.677-1.644.51-1.01.412-2.22-.257-3.13l-11-15C18.854 15.455 17.956 15 17 15s-1.854.455-2.42 1.226l-11 15c-.667.912-.767 2.122-.255 3.13C3.835 35.365 4.87 36 6 36h7l.012 16.003c.002 2.208 1.792 3.997 4 3.997h22.99c2.208 0 4-1.79 4-4s-1.792-4-4-4z'/>" +
                                    "</svg>" +retweet_count +
                                //"<span>" + sentiment_polarity + "<span>" +
                                //"<span>" + sentiment_subjectivity + "</span>" +
                            "</div>" +
                            "<p style='text-align: right;'>" + sentiment_polarity + "," + sentiment_subjectivity +"</p>" +
                            "<p style='text-align: right;'>"+datestr+"<br /></p>" +
                            "</div>\n";
                        elements += "<hr />";
                    }

                });

                $(object_div).append( "<div class='added'>" + elements + "</div>" );

            }
        )
    });

    // remove all added items when close
    $(object_div).on("sidebar:closed", function () {
        $('#close-right').hide();
        $(".added").remove();
    });

});