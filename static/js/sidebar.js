
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
