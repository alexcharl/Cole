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
        handleClicks();
        onResize();
        onThrottledResize();
        onDebouncedResize();
        $window.on("resize", onResize);
        $window.on("resize", throttledResize);
        $window.on("resize", debouncedResize);
        console.log("initMain");
    }
    function handleClicks() {
        $(".panel-open-icon").mouseover(function() {
            $el = $(this).parent();
            $el.addClass("hint");
        });
        $(".panel-open-icon").mouseout(function() {
            $el = $(this).parent();
            $el.removeClass("hint");
        });
        $(".panel-open-icon").click(function() {
            $el = $(this).parent();
            if ($el.hasClass("closed")) {
                $el.removeClass("closed").addClass("open");
            } else {
                $el.removeClass("open hint").addClass("closed");
            }
        });
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

var vaMediaUrl = "http://media.vam.ac.uk/media/thira/collection_images/";

var vaCollectionsUrl = "http://collections.vam.ac.uk/item/";

var searchTerms = [ "kettle", "chair", "lamp", "poster", "sculpture", "japan", "china", "islamic", "argentina", "africa", "united states" ];

var searchTerms2 = [ "Architecture", "Asia", "British Galleries", "Ceramics", "Childhood", "Contemporary", "Fashion & Jewellery", "Furniture", "Glass", "Metalwork", "Paintings & Drawings", "Photography", "Prints & Books", "Sculpture", "Textiles", "Theatre" ];

function chooseSearchTerm() {
    return searchTerms2[pumkin.randomNum(0, searchTerms.length)];
}

function makeVaRequest(objectNumber, searchTerm, withImages, limit, offset, withDescription, after, random) {
    objectNumber = typeof objectNumber !== "undefined" ? objectNumber : null;
    withImages = typeof withImages !== "undefined" ? withImages : "1";
    limit = typeof limit !== "undefined" ? limit : "45";
    searchTerm = typeof searchTerm !== "undefined" ? searchTerm : null;
    offset = typeof offset !== "undefined" ? offset : null;
    withDescription = typeof withDescription !== "undefined" ? withDescription : "1";
    after = typeof after !== "undefined" ? after : null;
    random = typeof random !== "undefined" ? random : "1";
    quality = typeof quality !== "undefined" ? quality : null;
    var expectFullResponse = objectNumber != null ? true : false;
    vaUrl = objectNumber != null ? vaUrl + objectNumber : vaUrl;
    console.log("expectFullResponse = " + expectFullResponse);
    console.log("vaUrl = " + vaUrl);
    $.ajax({
        dataType: "json",
        url: vaUrl,
        data: {
            images: withImages,
            limit: limit,
            offset: offset,
            random: random,
            quality: quality,
            pad: withDescription,
            after: after,
            q: searchTerm
        }
    }).done(function(data) {
        console.log("done");
        processResponse(data, expectFullResponse);
    }).fail(function() {
        console.log("error");
    }).always(function() {
        console.log("complete");
    });
}

function processResponse(data, expectFullResponse) {
    console.log(data);
    if (expectFullResponse !== true) {
        var numRecords = data.records.length;
        console.log("There are " + numRecords + " objects available.");
        if (numRecords > 0) {
            var whichObject = data.records[pumkin.randomNum(0, numRecords)];
            var objectNumber = whichObject.fields.object_number;
            makeVaRequest(objectNumber);
        } else {
            makeVaRequest(null, chooseSearchTerm());
        }
        return;
    }
    var objectInfo = data[0].fields;
    var imageId = objectInfo.primary_image_id;
    var imageIdPrefix = imageId.substr(0, 6);
    var theObject = objectInfo.object;
    var theTitle = objectInfo.title != "" ? objectInfo.title : objectInfo.object;
    var thePlace = objectInfo.place;
    var theDate = objectInfo.year_start;
    var theSlug = objectInfo.slug;
    var theArtist = objectInfo.artist;
    var theObjectNumber = objectInfo.object_number;
    var theMaterials = objectInfo.materials_techniques;
    var theDescription = objectInfo.public_access_description.replace(/\n/g, "<br>");
    var theContext = objectInfo.historical_context_note;
    var artistInfo = objectInfo.names[0].fields;
    var stillAlive = artistInfo.death_year != null ? false : true;
    var prefix = stillAlive ? "Born " : "";
    var suffix = stillAlive ? "" : " - " + artistInfo.death_year;
    var datesAlive = artistInfo.birth_year != null ? prefix + artistInfo.birth_year + suffix : "";
    var imgUrl = vaMediaUrl + imageIdPrefix + "/" + imageId + ".jpg";
    var objectUrl = vaCollectionsUrl + theObjectNumber + "/" + theSlug;
    $("#creator-name").text(theArtist);
    $("#dates-alive").text(datesAlive);
    $("#title").text(theTitle);
    $("#piece-date").text("(" + theDate + ")");
    $("#materials").text(theMaterials);
    $("#image").attr("src", imgUrl);
    $("#link").attr("href", objectUrl);
    $("#object-description").html("<p>" + theDescription + "</p>");
    $("#object-context").html("<p>" + theContext + "</p>");
}

makeVaRequest(null, chooseSearchTerm());

(function(window, $) {
    var pumkin = window.pumkin = window.pumkin || {};
    var SITE = window.SITE = window.SITE || {};
    $(function() {
        SITE.initGlobal();
        SITE.initMain();
    });
})(this, this.jQuery);
//# sourceMappingURL=scripts.js.map