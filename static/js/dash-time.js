// control time range slider

var $range = $("#range");

$range.ionRangeSlider({
    type: "single",
    //min: +moment().subtract(35, "days").format("X"),
    //max: +moment().format("X"),
    //from: +moment().subtract(1, "months").format("X"),
    min: new Date('2016.03.06').getTime() / 1000,
    max: new Date('2016.04.03').getTime() / 1000,
    from: new Date('2016.03.21').getTime() / 1000,
    prettify: function (num) {
        return moment(num, "X").format("LL");
    },
    onStart: function (data) {
        //console.log("onStart");
    },
    onChange: function (data) {
        //console.log("onChange");
        //console.log($("#range").val())
    },
    onFinish: function (data) {
        //console.log("onFinish");
    },
    onUpdate: function (data) {
        //console.log("onUpdate");
    }
});

$range.on("change", function () {
    $(".sidebar.right").trigger("sidebar:" + "close");
    updateSentiment();
});

//function changeCellValue(tableId, cellId, val){
//    $(tableId).find('td#'+cellId).html(20)
//}
function updateSentiment(){

    var sentiment_pol = [];
    var sentiment_sub = [];
    d3.selectAll(".node").each(function(d){
        sentiment_pol = sentiment_pol.concat(d.sentiment[0]);
        sentiment_sub = sentiment_sub.concat(d.sentiment[1]);
    })

    //console.log($("senti-data-pol").html());
    $('#control-table').find('td#'+'senti-data-pol').html(mean(sentiment_pol).toFixed(3));
    $('#control-table').find('td#'+'senti-data-sub').html(mean(sentiment_sub).toFixed(3));
}

function mean(array){
    var total = 0;
    //var length = array.length;
    array.forEach(function (i) {
        total += i;
    });
    return total / array.length;
}