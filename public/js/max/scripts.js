var pumkin = window.pumkin = {};

(function(window, $, Modernizr) {
    function getTransformValues($element, type) {
        var transformMatrix = $element.css("transform");
        var transformValues = transformMatrix.match(/-?[0-9\.]+/g);
        var scale = transformValues[0];
        var translate = {
            x: transformValues[4] / scale,
            y: transformValues[5] / scale
        };
        if (type === "scale") {
            return scale;
        } else if (type === "translate") {
            return translate;
        } else if (type === "raw") {
            return transformValues;
        }
    }
    function checkKey(e) {
        e = e || window.event;
        return e.keyCode;
    }
    function makePlaceholders(els, activeClass) {
        activeClass = activeClass || "active";
        $(els).each(function() {
            var $el = $(this);
            var placeholder = $el.data().placeholder;
            $el.val(placeholder);
            if ($.trim($el.val()) === "") {
                $el.val(placeholder).removeClass(activeClass);
            }
            $el.focus(function() {
                if ($el.val() === placeholder) {
                    $el.val("").addClass(activeClass);
                }
            }).blur(function() {
                if ($.trim($el.val()) === "") {
                    $el.val(placeholder).removeClass(activeClass);
                }
            });
        });
    }
    function svgFallback() {
        $("img[src$='.svg']").each(function() {
            var $el = $(this);
            var origSrc = $el.attr("src");
            var pngSrc = origSrc.replace(".svg", ".png");
            $el.attr("src", pngSrc);
        });
    }
    function normalizeBoxHeights($els) {
        var max = 0;
        $els.each(function() {
            max = Math.max($(this).height(), max);
        });
        $els.each(function() {
            $(this).height(max);
        });
    }
    function randomNum(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    function autoFit($container, $items, margin, doHeightToo, includeLastRow, varyHeight, allSameWidth) {
        console.log("autoFit: " + $items.length);
        margin = margin || 0;
        var containerWidth = $container.width() - margin;
        $items.removeAttr("style");
        var allTheRows = [];
        var rowWidth = 0;
        var thisRow = [];
        $items.each(function() {
            var $this = $(this);
            rowWidth += parseInt($this.css("width")) + margin;
            if (rowWidth <= containerWidth) {
                thisRow.push($this);
            } else {
                allTheRows.push(thisRow);
                thisRow = new Array($this);
                rowWidth = parseInt($this.css("width")) + margin;
            }
            if ($this.is(":last-child") && includeLastRow) {
                allTheRows.push(thisRow);
            }
        });
        var numRows = allTheRows.length;
        for (var r = 0; r < numRows; r++) {
            var itemsInRow = allTheRows[r].length;
            var rowTotalWidth = 0;
            for (var i = 0; i < itemsInRow; i++) {
                rowTotalWidth += parseInt(allTheRows[r][i].css("width")) + margin;
            }
            var remainderWidth = containerWidth - rowTotalWidth;
            var spaceToAdd = remainderWidth / itemsInRow;
            var avgItemWidth = rowTotalWidth / itemsInRow;
            var newRowTotalWidth = 0;
            if (allSameWidth) {
                var theWidth = parseInt(allTheRows[0][0].css("width"));
            }
            for (i = 0; i < itemsInRow; i++) {
                var itemWidth = parseInt(allTheRows[r][i].css("width"));
                var itemRatio = itemWidth / avgItemWidth;
                var newWidth = allSameWidth ? itemWidth + spaceToAdd : itemWidth + Math.floor(spaceToAdd * itemRatio);
                var newHeight;
                if (r === 0 && i === 0) {
                    var itemHeight = parseInt(allTheRows[r][i].css("height"));
                    newHeight = doHeightToo ? Math.floor(newWidth * (itemHeight / itemWidth)) : itemHeight;
                }
                if (varyHeight) {
                    allTheRows[r][i].css({
                        width: newWidth
                    });
                } else {
                    allTheRows[r][i].css({
                        width: newWidth,
                        height: newHeight
                    });
                }
                newRowTotalWidth += newWidth + margin;
            }
            var difference = containerWidth - newRowTotalWidth;
            allTheRows[r][itemsInRow - 1].css("width", parseInt(allTheRows[r][itemsInRow - 1].css("width")) + difference);
        }
    }
    function intelliLoad($imgs, src, revealOnLoad) {
        revealOnLoad = typeof imagesLoaded === "function" ? revealOnLoad : false;
        $imgs.each(function() {
            var $img = $(this);
            var src = src || $img.data("src");
            if (revealOnLoad) {
                $img.css({
                    opacity: 0
                });
            }
            if (!$img.attr("src")) {
                $img.attr("src", src);
                console.log("INTELLILOAD: is image?" + $img.is("img"));
                if (revealOnLoad && $img.is("img")) {
                    console.log("INTELLILOAD: revlealOnLoad: " + src);
                    $img.imagesLoaded().done(function(instance, image) {
                        console.log("INTELLILOAD: imagesLoaded: " + image.attr("src"));
                        image.css({
                            opacity: 1
                        });
                    });
                }
            }
        });
    }
    function defineDeviceVariables() {
        var deviceVariables;
        deviceVariables = {
            isMobile: $("#mobileTester").css("visibility") === "visible" ? true : false,
            isTablet: $("#tabletTester").css("visibility") === "visible" ? true : false,
            isTouch: Modernizr.touch ? true : false
        };
        deviceVariables.isDevice = deviceVariables.isMobile || deviceVariables.isTablet ? true : false;
        return deviceVariables;
    }
    function browserDetection() {
        var browser = {};
        browser.isChrome = navigator.userAgent.indexOf("Chrome") > -1;
        browser.isExplorer = navigator.userAgent.indexOf("MSIE") > -1;
        browser.isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
        browser.isSafari = navigator.userAgent.indexOf("Safari") > -1;
        browser.isOpera = navigator.userAgent.indexOf("Presto") > -1;
        if (browser.isChrome && browser.isSafari) {
            browser.isSafari = false;
        }
        return browser;
    }
    pumkin = {
        getTransformValues: getTransformValues,
        checkKey: checkKey,
        svgFallback: svgFallback,
        normalizeBoxHeights: normalizeBoxHeights,
        randomNum: randomNum,
        autoFit: autoFit,
        defineDeviceVariables: defineDeviceVariables,
        browserDetection: browserDetection,
        makePlaceholders: makePlaceholders,
        intelliLoad: intelliLoad
    };
})(this, this.jQuery, this.Modernizr);

(function(window, $, Modernizr) {
    var pumkin = window.pumkin;
    var SITE = window.SITE = window.SITE || {};
    function initGlobal() {
        var gv;
        gv = window.gv = {
            $window: $(window),
            $document: $(document),
            $html: $("html"),
            $body: $("body"),
            WIDTH: $(window).width(),
            HEIGHT: $(window).height(),
            deviceVariables: pumkin.defineDeviceVariables(),
            browser: pumkin.browserDetection(),
            $wrapper: $("#wrapper")
        };
        console.log("initGlobal");
    }
    SITE.initGlobal = initGlobal;
})(this, this.jQuery, this.Modernizr);

(function(window, $, Modernizr, screenfull, FastClick) {
    var pumkin = window.pumkin;
    var SITE = window.SITE = window.SITE || {};
    var $window = null;
    var $body = null;
    var WIDTH = null;
    var HEIGHT = null;
    var isMobile = null;
    var isTablet = null;
    var isDevice = null;
    var isTouch = null;
    var browser;
    var $wrapper;
    function defineVars() {
        var gv = window.gv;
        $window = gv.$window;
        $body = gv.$body;
        WIDTH = gv.WIDTH;
        HEIGHT = gv.HEIGHT;
        $wrapper = gv.$wrapper;
        isMobile = gv.deviceVariables.isMobile;
        isTablet = gv.deviceVariables.isTablet;
        isDevice = gv.deviceVariables.isDevice;
        isTouch = gv.deviceVariables.isTouch;
        browser = gv.browser;
    }
    function initMain() {
        defineVars();
        initFastclick();
        onResize();
        onThrottledResize();
        onDebouncedResize();
        $window.on("resize", onResize);
        $window.on("resize", throttledResize);
        $window.on("resize", debouncedResize);
        console.log("initMain");
    }
    function onResize() {
        WIDTH = $window.width();
        HEIGHT = $window.height();
    }
    function onThrottledResize() {
        console.log("throttle");
    }
    function onDebouncedResize() {
        console.log("debounce");
    }
    var throttledResize = $.throttle(250, function() {
        onThrottledResize();
    });
    var debouncedResize = $.debounce(100, function() {
        onDebouncedResize();
    });
    function initFastclick() {
        FastClick.attach(document.body);
    }
    SITE.initMain = initMain;
})(this, this.jQuery, this.Modernizr, this.screenfull, this.FastClick);

var vaUrl = "http://www.vam.ac.uk/api/json/museumobject/";

var searchTerms = [ "william morris", "maucherat", "mcqueen", "eames", "gilbert", "stein" ];

var vaSearch = searchTerms[pumkin.randomNum(0, searchTerms.length)];

function makeVaRequest(searchTerm) {
    $.ajax({
        dataType: "json",
        url: vaUrl,
        data: {
            images: "1",
            limit: "45",
            namesearch: searchTerm
        }
    }).done(function(data) {
        console.log("done");
        processResponse(data);
    }).fail(function() {
        console.log("error");
    }).always(function() {
        console.log("complete");
    });
}

function processResponse(data) {
    console.log(data);
    var numRecords = data.records.length;
    $("#result").text("There are " + numRecords + " images available.");
    if (numRecords > 0) {
        var whichRecord = pumkin.randomNum(0, numRecords);
        console.log("record = " + whichRecord);
        var imageId = data.records[whichRecord].fields.primary_image_id;
        var imageIdPrefix = imageId.substr(0, 6);
        imgUrl = "http://media.vam.ac.uk/media/thira/collection_images/" + imageIdPrefix + "/" + imageId + ".jpg";
        $("#image").attr("src", imgUrl);
    } else {}
}

makeVaRequest(vaSearch);

(function(window, $) {
    var pumkin = window.pumkin = window.pumkin || {};
    var SITE = window.SITE = window.SITE || {};
    $(function() {
        SITE.initGlobal();
        SITE.initMain();
    });
})(this, this.jQuery);
//# sourceMappingURL=scripts.js.map