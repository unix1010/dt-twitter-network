// control time range slider

var $range = $("#range");

$range.ionRangeSlider({
    type: "single",
    min: +moment().subtract(35, "days").format("X"),
    max: +moment().format("X"),
    from: +moment().subtract(1, "months").format("X"),
    prettify: function (num) {
        return moment(num, "X").format("LL");
    },
    onStart: function (data) {
        console.log("onStart");
    },
    onChange: function (data) {
        console.log("onChange");
        //console.log($("#range").val())
    },
    onFinish: function (data) {
        console.log("onFinish");
    },
    onUpdate: function (data) {
        console.log("onUpdate");
    }
});

$range.on("change", function () {

    $(".sidebar.right").trigger("sidebar:" + "close");

});