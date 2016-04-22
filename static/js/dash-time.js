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

});