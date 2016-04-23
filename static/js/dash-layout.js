// network graph: force layout using D3.js

var test = 0;
// initialise
var width = $('.map').width(),
    height = $('.map').height();

var color = d3.scale.category20();

// construct a new "force-directed graph layout"
var force = d3.layout.force()
    .gravity(0)
    //.charge(0)
    //.linkDistance(30)
    .charge(function(d, i) { return i ? 0 : -0.00005; })
    .size([width, height]);

// initialise svg
var svg = d3.select("#force-layout").append("svg")
    .attr("width", width)
    .attr("height", height);


d3.json("/dashboard/data", function(error, graph) {
    $(function() {

        //if (error) throw error;
        var nodes = graph.nodes.slice(),
            links = [],
            bilinks = [];
        // construct a new map
        var nodeById = d3.map();

        var public_pol = new Array(2),
            public_sub = new Array(2);
        // *(IMPORTANT STEP for "node by name")
        // copy all "graph.nodes"(array of Objects) from "nodes"(JSON) to the map
        // nodeById: ( key: 1179833635, value: Object { id: "1179833635", value: 10 } )
        graph.nodes.forEach(function (node) {
            nodeById.set(node.id, node);
        });

        // BELOW IS USED TO DISPLAY A CURVE LINK
        /*
            // *(IMPORTANT STEP for "node by name")
            //      assign the node details into "links"
            // *(IMPORTANT STEP for "curved lines")
            //      use an intermediate node to have a curved link
            graph.links.forEach(function(link) {
                var s = nodeById.get(link.source),
                    t = nodeById.get(link.target),
                    i = {}, // intermediate node
                    c = link.created_at;

                nodes.push(i);
                links.push({source: s, target: i, created_at: c}, {source: i, target: t, created_at: c});
                bilinks.push([s, i, t, c]);
            });
        */

        // NOW LINKS ARE STRAIGHT
        // *(IMPORTANT STEP for "node by name")
        // assign the node details into "links"
        // link: {source: Object { id: "foo1", value: v1 }, target: Object { id: "foo2", value: v2 }}
        graph.links.forEach(function (link) {
            link.source = nodeById.get(link.source);
            link.target = nodeById.get(link.target);
        });

        // start the simulation
        force
            .nodes(nodes)
            .links(graph.links)
            .start();

        // build the arrow.
        svg.append("svg:defs").selectAll("marker")
            .data(["end"])      // Different link/path types can be defined here
            .enter().append("svg:marker")    // This section adds in the arrows
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", 1.5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("svg:path")
            .style("fill", "grey")
            .attr("d", "M0,-5L10,0L0,5");

        // create links under svg
        var link = svg.selectAll(".link")   // select all: class="link"
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link")   // <line class="link"> </line>
            .attr("marker-end", "url(#end)");

        // create the groups (node and label) under svg
        var gnodes = svg.selectAll('g.gnode')
            .data(graph.nodes)
            .enter()
            .append('g')
            //.on("click", click)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .classed('gnode', true);

        //console.log(gnodes);

        // add nodes(circle) into each group
        var node = gnodes.append("circle")
            .attr("class", "node")
            //.attr("r", function(d){return d.status_num / 20})
            .attr("r", 1)
            //.style("fill", function (d) { return color(d.id % 1000000); })
            .style("opacity", 0.95)
            .call(force.drag);

        node.append("title")
            .text(function(d) { return d.id; });

        // add label text into each group
        var labels = gnodes.append("text")
            .text(function (d) { return d.id; })
            .style("fill", "grey")
            .attr("font-size", 10);

        // register the listener and receive events
        // "tick" - dispatched for each tick of simulation
        // (update the displayed positions of nodes and links)
        force.on("tick", function() {
            var q = d3.geom.quadtree(nodes),
                i = 0,
                n = nodes.length;


            while (++i < n) {
                q.visit(collide(nodes[i]));
            }

            //if (test == 0) test = 1;

            // NOW LINKS ARE STRAIGHT
            link.style("display", function(d) {
                if( d.created_at/1000 > Number($("#range").val())
                    || d.source.first_created_at/1000 > Number($("#range").val())
                    || d.target.first_created_at/1000 > Number($("#range").val())
                ){
                    return "none";
                }
            });

            link.attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            // show nodes according to timeline
            node.style("display", function(d) {
                if(d.first_created_at/1000 > Number($("#range").val())) {
                    return "none";
                }

            });

            // update node positions
            node.attr("transform", function(d) {
                var r = d.status_num / 20;

                d.x = Math.max(r, Math.min(width - r, d.x));
                d.y = Math.max(r, Math.min(height - r, d.y));

                return "translate(" + d.x + "," + d.y + ")";
            });


            // change node colour based on sentiment so far
            node.style("fill", function(d) {
                d.sentiment = new Array(2);
                d.sentiment[0] = [];
                d.sentiment[1] = [];


                d.status_object.forEach(function(obj){
                    if (obj.created_at/1000 <= Number($("#range").val())){
                        d.sentiment[0].push(obj.sentiment[0]);
                        d.sentiment[1].push(obj.sentiment[1]);
                    }
                });
                //console.log(public_pol[0]/public_pol[1] +","+public_sub[0]/public_sub[1]);

                // define sentiment colour
                var total_pos = new Array(2).fill(0);
                var total_neg = new Array(2).fill(0);

                d.sentiment[0].forEach(function(i){
                    if (i > 0) {
                        total_pos[0] += i;
                        total_pos[1] += 1;
                    } else if(i < 0) {
                        total_neg[0] += i;
                        total_neg[1] += 1;
                    }
                });
                var avg_pos = total_pos[1] > 0 ? total_pos[0] / total_pos[1] : 0;
                var avg_neg = total_neg[1] > 0 ? -1 * total_neg[0] / total_neg[1] : 0;
                //if (test == 0 ){
                //console.log(Date.now()-timerStart);
                //test = 1;
                //console.log(total_neg[0]);
                //console.log(avg_neg);
                    //test = 1;
                //}
                return d3.rgb(avg_neg*255,avg_pos*255,65);

            });

            if (test == 0 ){
                //console.log(Date.now()-timerStart);
                //test = 1;
                //console.log(node);
                test = 1;
            }

            // node size grows as time goes by
            node.attr("r", function(d) {
                var count = 0;
                d.status_object.forEach(function(obj){
                    if (obj.created_at/1000 <= Number($("#range").val())){
                        count += 1;
                    }
                });
                return count/20;
            });

            // BELOW IS USED TO DISPLAY LABEL, AND LABEL IS HIDDEN FOR NOW
            /*
                // update label positions (text)
                labels.attr("x", function(d) { return d.x + 15; })
                    .attr("y", function(d) {return d.y; });
            */
        });


    });

    // FOR TESTING
    /*
        $(document).ready(function() {
                console.log("Time until DOMready: ", Date.now()-timerStart);
            });
        $(window).load(function() {
            console.log("Time until everything loaded: ", Date.now()-timerStart);
        });
    */

});

function click(d){

    var x, y, k;

    if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
    } else {
        x = width / 2;
        y = height / 2;
        k = 1;
        centered = null;
    }

    g.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

    g.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
}

// mouse over: show some info
function mouseover(d) {
    var font_size = 15;

    var mydate = new Date(d.first_created_at);
    var year = mydate.getFullYear();
    var month = mydate.getMonth()+1;
    var date = mydate.getDate();
    var hour = mydate.getHours();
    var min = mydate.getMinutes();
    var sec = mydate.getSeconds();
    var datestr =  date +'/'+ month +'/'+ year +'/'+ hour +':'+ min +':'+ sec;
    //var r = d3.select(this).select('.node').attr("r");

    d3.select(this).select('.node').style("stroke", "#FFFF7B");
    d3.select(this).select('.node').style("stroke-width", "3px");

    d3.select(this).append("text")
        .attr("class", "hover")
        .attr('transform', function(d){
            return 'translate('+ d.px + ',' + d.py + ')';
        })
        //                .text("hi!")
        .attr("font-size", font_size)

        .append('svg:tspan')
        .attr('x', 0)
        .attr('dy', font_size)
        .text("first_created_at: "+  datestr)

        .append('svg:tspan')
        .attr('x', 0)
        .attr('dy', font_size)
        .text("id: "+ d.id)

        .append('svg:tspan')
        .attr('x', 0)
        .attr('dy', font_size)
        .text("status_num: "+ d.status_num)
    ;
}

// become back when mouse out
function mouseout(d) {
    d3.select(this).select("text.hover").remove();
    d3.select(this).select('.node').style("stroke", "#fff");
    d3.select(this).select('.node').style("stroke-width", "0.5px");
}



/* collision detection */
function collide(node) {
    node.radius = node.status_num / 20;

    var r = node.radius + 100,

    /*
     * the reason where defining this collide() is to cal the following variables
     * , which will be used in the callback func
     * top left:     (nx1, ny1)
     * bottom right: (nx2, ny2)
     */
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;

    /* a callback func where node being visited
     * and the remaining arguments are the coordinate.
     * */
    return function(quad, x1, y1, x2, y2) {

        /* detect collision:
         * there is a point which is not mine, see if we collide
         * */
        //if (test == 0) console.log(node);
        if (quad.point && (quad.point !== node)) {
            //if (test == 0) console.log(quad.point.id +","+node.id);
            //if (test == 0) console.log(node.id);

            var x = node.x - quad.point.x,
                y = node.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),   // distance between two centers
                r = node.radius + quad.point.radius;    // sum of radius

            //console.log(nx1 + ", " +nx2 + ", " +ny1 + ", " +ny2 + ", " + "\tl: " + l + ",r: " + r);
            /* distance < radius sum -> FOUND collision! -> change position to avoid collision*/
            if (l < r) {
                //if (test == 0) console.log(node.index + " , " + quad.point.index);
                l = (l - r) / l * .5;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
            }
        }

        /* If return false, the node is in this quad! -> visit the next level;
         * if return true, out of this quad, visit search next quad.
         * */
        return x1 > nx2         // out of RIGHT bound
            || x2 < nx1     // out of LEFT bound
            || y1 > ny2     // out of BOTTOM bound
            || y2 < ny1;    // out of TOP bound

    };
}
