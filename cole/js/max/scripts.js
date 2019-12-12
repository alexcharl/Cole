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
        $textContent = $(".text-content-column");
        $objectCaption = $(".object-caption");
        $downArrow = $(".down-arrow");
        $objectHeader = $(".object-header");
        $sidePanel = $(".side-panel");
        $sidePanelOpenBtn = $(".more");
        $sidePanelCloseBtn = $(".close-side-panel");
        $historyOpenBtn = $(".history");
        $overlayCloseBtn = $(".close-overlay");
        $overlay = $(".overlay");
        $techInfo = $(".technical-info .text-content");
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
        onThrottledScroll();
        $textContent.on("scroll", throttledScroll);
        console.log("initMain");
    }
    function handleClicks() {
        $sidePanelOpenBtn.click(function() {
            if ($sidePanel.hasClass("open")) {
                $sidePanel.removeClass("open");
            } else {
                $sidePanel.addClass("open");
            }
        });
        $sidePanelCloseBtn.click(function() {
            $sidePanel.removeClass("open");
        });
        $downArrow.click(function() {
            $(".object-text").velocity("scroll", {
                duration: 700,
                offset: -100,
                easing: "ease-in-out",
                container: $textContent
            });
        });
        $historyOpenBtn.click(function() {
            if ($overlay.hasClass("closed")) {
                $overlay.removeClass("closed").addClass("open for-history");
                showHistory();
                $overlay.fadeIn(500);
            }
        });
        $overlayCloseBtn.click(function() {
            $overlay.removeClass("open for-history").addClass("closed");
            $overlay.fadeOut(500);
        });
        $(".go-to-options").click(function() {
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL("/src/options/index.html"));
            }
        });
    }
    function throwError() {
        $overlay.removeClass("closed").addClass("open for-warning");
        $overlay.fadeIn(500);
    }
    function showHistory() {
        searchCount = 0;
        makeVaRequest(theHistory[0], undefined, undefined, undefined, undefined, true);
        $(".history-wrapper .loading").addClass("loaded");
    }
    function hideHistory() {
        console.log("hiding history");
        $("#history-objects").text("");
        $(".history-wrapper .loading").removeClass("loaded");
    }
    function onThrottledScroll() {
        var scrollAmt = $textContent.scrollTop();
        if (scrollAmt > HEIGHT * .5) {
            $objectCaption.addClass("reveal");
        } else {
            $objectCaption.removeClass("reveal");
        }
        if (scrollAmt > HEIGHT * .5) {
            $objectHeader.addClass("hide");
        } else {
            $objectHeader.removeClass("hide");
        }
    }
    var throttledScroll = function() {
        onThrottledScroll();
    };
    function onResize() {
        WIDTH = $window.width();
        HEIGHT = $window.height();
    }
    function onThrottledResize() {}
    function onDebouncedResize() {}
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
    SITE.throwError = throwError;
    SITE.onThrottledResize = onThrottledResize;
    SITE.showHistory = showHistory;
    SITE.hideHistory = hideHistory;
})(this, this.jQuery, this.Modernizr, this.screenfull, this.FastClick);

var vaUrl = "https://www.vam.ac.uk/api/json/museumobject/";

var vaMediaUrl = "https://media.vam.ac.uk/media/thira/collection_images/";

var vaCollectionsUrl = "https://collections.vam.ac.uk/item/";

var defaultSearchTerms = [ "Architecture", "Asia", "British Galleries", "Ceramics", "Childhood", "Contemporary", "Fashion", "Jewellery", "Furniture", "Glass", "Metalwork", "Paintings", "Drawings", "Photography", "Prints", "Books", "Sculpture", "Textiles", "Theatre" ];

var theSearchTerms;

var theReadableSearchTerms;

var chosenSearchTerm;

var strictSearch = false;

var searchCount = 0;

var maxSearchCounts = 5;

var historyCount = 0;

var maxHistoryItems = 8;

var imageId;

var theHistory = new Array();

function start() {
    if (typeof chrome != "undefined" && typeof chrome.storage != "undefined") {
        chrome.storage.sync.get({
            userSearchTerms: "",
            strictSearch: "fuzzy",
            history: []
        }, function(items) {
            if (items.userSearchTerms.length > 0) {
                console.log("using user search terms: " + items.userSearchTerms);
                theReadableSearchTerms = items.userSearchTerms.toString();
                theSearchTerms = items.userSearchTerms.replace(/ /g, "+").split(",");
            } else {
                console.log("using default search terms: " + defaultSearchTerms);
                theReadableSearchTerms = defaultSearchTerms.toString();
                theSearchTerms = defaultSearchTerms;
            }
            console.log("strictSearch setting = " + items.strictSearch);
            if (items.strictSearch == "strict") {
                strictSearch = true;
            }
            if (items.history.length > 0) {
                theHistory = items.history;
            }
            chooseSearchTerm();
            makeVaRequest(null, chosenSearchTerm);
        });
    } else {
        console.log("Running as standalone page, using default search terms: " + defaultSearchTerms);
        theSearchTerms = defaultSearchTerms;
        theReadableSearchTerms = defaultSearchTerms.toString();
        chooseSearchTerm();
        makeVaRequest(null, chosenSearchTerm);
    }
}

function chooseSearchTerm() {
    chosenSearchTerm = theSearchTerms[pumkin.randomNum(0, theSearchTerms.length)];
}

function addToHistory(objectNumber) {
    theHistory.unshift(objectNumber);
    if (theHistory.length > 10) {
        theHistory.pop();
    }
    chrome.storage.sync.set({
        history: theHistory
    });
}

function makeVaRequest(objectNumber, searchTerm, offset, limit, after, forHistory) {
    if (searchCount < maxSearchCounts) {
        searchCount++;
        objectNumber = typeof objectNumber !== "undefined" ? objectNumber : null;
        limit = typeof limit !== "undefined" ? limit : "1";
        searchTerm = typeof searchTerm !== "undefined" ? searchTerm : null;
        offset = typeof offset !== "undefined" ? offset : null;
        withDescription = typeof withDescription !== "undefined" ? withDescription : "1";
        after = typeof after !== "undefined" ? after : null;
        quality = typeof quality !== "undefined" ? quality : null;
        var expectResponse = 0;
        if (offset != null) {
            expectResponse = 1;
        } else if (objectNumber != null) {
            if (forHistory == true) {
                expectResponse = 3;
            } else {
                expectResponse = 2;
            }
        }
        if (strictSearch == true) {
            var searchItem = searchTerm;
            var searchTerm = null;
        } else {
            var searchItem = null;
        }
        console.log("strictSearch = " + strictSearch);
        var queryUrl = "";
        queryUrl = objectNumber != null ? vaUrl + objectNumber : vaUrl;
        console.log("expectResponse = " + expectResponse);
        console.log("queryUrl = " + queryUrl);
        console.log("Chosen term = " + searchTerm);
        console.log("Chosen item name = " + searchItem);
        console.log("offset = " + offset);
        console.log("after = " + after);
        console.log("limit = " + limit);
        $.ajax({
            type: "get",
            url: queryUrl,
            dataType: "json",
            cache: false,
            data: {
                limit: limit,
                offset: offset,
                images: 1,
                quality: quality,
                pad: withDescription,
                after: after,
                objectnamesearch: searchItem,
                q: searchTerm
            },
            error: function(xhr, textStatus, thrownError) {
                console.log("error status= " + textStatus);
                console.log("error thrown= " + thrownError);
            }
        }).done(function(data) {
            console.log("done, received data\n\n");
            processResponse(data, expectResponse);
        }).fail(function() {
            console.log("error");
        }).always(function() {
            console.log("complete");
        });
    } else {
        console.log("maximum number of search attempts reached, try changing search terms");
        SITE.throwError();
    }
}

function processResponse(data, expectResponse) {
    console.log(data);
    if (expectResponse === 0) {
        var numRecords = data.records.length;
        if (numRecords > 0) {
            var randomOffset = pumkin.randomNum(0, data.meta.result_count - 1);
            console.log("total results = " + data.meta.result_count);
            console.log("making query 2. Returning a new set of results from " + data.meta.result_count + " results with randomOffset of " + randomOffset);
            makeVaRequest(null, chosenSearchTerm, randomOffset, 1);
        } else {
            console.log("making a second request, no results found last time");
            chooseSearchTerm();
            makeVaRequest(null, chosenSearchTerm, null, 15);
        }
        return;
    }
    if (expectResponse === 1) {
        var numRecords = data.records.length;
        var randomNum = pumkin.randomNum(0, numRecords);
        var whichObject = data.records[randomNum];
        var objectNumber = whichObject.fields.object_number;
        imageId = whichObject.fields.primary_image_id;
        console.log("Making query 3. Choosing object " + objectNumber + " at position " + randomNum + " from " + numRecords + " available objects.");
        makeVaRequest(objectNumber);
        addToHistory(objectNumber);
        return;
    }
    var objectInfo = data[0].fields;
    imageId = typeof objectInfo.primary_image_id == "undefined" ? imageId : objectInfo.primary_image_id;
    var imageIdPrefix = imageId.substr(0, 6);
    var theObject = objectInfo.object;
    var theTitle = objectInfo.title != "" ? objectInfo.title : objectInfo.object;
    var theDate = objectInfo.year_start;
    var theSlug = objectInfo.slug;
    var theArtist = objectInfo.artist;
    var theObjectNumber = objectInfo.object_number;
    var theMaterials = objectInfo.materials_techniques;
    var theDescription = objectInfo.public_access_description;
    var theContext = objectInfo.historical_context_note;
    if (typeof objectInfo.names[0] !== "undefined") {
        var artistInfo = objectInfo.names[0].fields;
    }
    if (typeof artistInfo != "undefined") {
        var stillAlive = typeof artistInfo.death_year != "undefined" && artistInfo.death_year != 0 ? false : true;
        var prefix = stillAlive || artistInfo.death_year == null ? "Born " : "";
        var suffix = stillAlive || artistInfo.death_year == null ? "" : " - " + artistInfo.death_year;
        var datesAlive = artistInfo.birth_year != null && artistInfo.death_year != 0 ? prefix + artistInfo.birth_year + suffix : "";
        var datesAlive = datesAlive != "" && datesAlive != "I" ? "(" + datesAlive + ")" : "";
    }
    var imgUrl = vaMediaUrl + imageIdPrefix + "/" + imageId + ".jpg";
    var objectUrl = vaCollectionsUrl + theObjectNumber + "/" + theSlug;
    theTitle = theTitle.replace(/\^/, "");
    theTitle = theTitle.replace(/\<i\>/g, "");
    theTitle = theTitle.replace(/\<\\i\>/g, "");
    theTitle = theTitle.replace(/\<b\>/g, "");
    theTitle = theTitle.replace(/\<\\b\>/g, "");
    theDate = typeof theDate !== "undefined" && theDate != null ? theDate : "";
    var theCaption = "<strong>" + theTitle + ", " + theDate + "</strong>" + " &mdash; " + theArtist;
    if (expectResponse === 2) {
        theDescription = theDescription.replace(/Object Type\n/g, "");
        theDescription = theDescription.replace(/People\n/g, "");
        theDescription = theDescription.replace(/Place\n/g, "");
        theDescription = theDescription.replace(/Places\n/g, "");
        theDescription = theDescription.replace(/Time\n/g, "");
        theDescription = theDescription.replace(/Design \& Designing\n/g, "");
        theDescription = theDescription.replace(/Design\n/g, "");
        theDescription = theDescription.replace(/Subject Depicted\n/g, "");
        theDescription = theDescription.replace(/Subjects Depicted\n/g, "");
        theDescription = theDescription.replace(/Materials \& Making\n/g, "");
        theDescription = theDescription.replace(/Collectors \& Owners\n/g, "");
        theDescription = theDescription.replace(/Ownership \& Use\n/g, "");
        theDescription = theDescription.replace(/Trading\n/g, "");
        theDescription = theDescription.replace(/Trade\n/g, "");
        theDescription = theDescription.replace(/Historical Associations\n/g, "");
        theDescription = theDescription.replace(/Other\n/g, "");
        theDescription = theDescription.replace(/\n\n\n/g, "\n\n");
        theDescription = theDescription.replace(/\n/g, "<br>");
        theDescription = theDescription.replace(/\<i\>/g, "");
        theDescription = theDescription.replace(/\<\\i\>/g, "");
        theDescription = theDescription.replace(/\<b\>/g, "");
        theDescription = theDescription.replace(/\<\\b\>/g, "");
        var thePhysicalDescription = objectInfo.physical_description;
        var theDimensions = objectInfo.dimensions;
        var thePlace = objectInfo.place;
        var theMuseumNumber = objectInfo.museum_number;
        var theMuseumLocation = objectInfo.location;
        thePhysicalDescription = thePhysicalDescription.replace(/\<i\>/g, "");
        thePhysicalDescription = thePhysicalDescription.replace(/\<\\i\>/g, "");
        thePhysicalDescription = thePhysicalDescription.replace(/\<b\>/g, "");
        thePhysicalDescription = thePhysicalDescription.replace(/\<\\b\>/g, "");
        theReadableSearchTerms = theReadableSearchTerms.replace(/,(?=[^\s])/g, ", ");
        var pinterestUrl = "https://www.pinterest.com/pin/create/button/";
        pinterestUrl += "?url=" + objectUrl;
        pinterestUrl += "&media=" + imgUrl;
        pinterestUrl += "&description=" + theTitle;
        if (theDate != "") pinterestUrl += " (" + thePlace + ", " + theDate + ")";
        pinterestUrl += ", V%26A Collection";
        if (theTitle.length > 20 && theTitle.length <= 40) {
            $("#title").parent().addClass("reduced");
        }
        if (theTitle.length > 40) {
            $("#title").parent().addClass("reduced-more");
        }
        $("#creator-name").text(theArtist);
        $("#dates-alive").text(datesAlive);
        $("#title").html(theTitle);
        if (theDate != "") $("#piece-date").text(theDate);
        $("#place").html(thePlace);
        $("#image").attr("src", imgUrl);
        $("#pinterest-button").attr("href", pinterestUrl);
        $("#page-link").attr("href", objectUrl);
        $("#object-description").html("<p>" + theDescription + "</p>");
        $("#object-context").html("<p>" + theContext + "</p>");
        $("#object-caption").html(theCaption);
        if (thePhysicalDescription != "") {
            $("#physical-description").html(thePhysicalDescription);
        } else {
            $("#physical-description").hide();
            $("#physical-description").prev("h4").hide();
        }
        if (theDate != "") {
            $("#tech-info-piece-date").text(theDate);
        } else {
            $("#tech-info-piece-date").hide();
            $("#tech-info-piece-date").prev("h4").hide();
        }
        if (theArtist != "") {
            $("#tech-info-creator-name").text(theArtist);
        } else {
            $("#tech-info-creator-name").hide();
            $("#tech-info-creator-name").prev("h4").hide();
        }
        if (theMaterials != "") {
            $("#tech-info-materials").html(theMaterials);
        } else {
            $("#tech-info-materials").hide();
            $("#tech-info-materials").prev("h4").hide();
        }
        if (thePlace != "") {
            $("#tech-info-place").text(thePlace);
        } else {
            $("#tech-info-place").hide();
            $("#tech-info-place").prev("h4").hide();
        }
        if (theDimensions != "") {
            $("#dimensions").text(theDimensions);
        } else {
            $("#dimensions").hide();
            $("#dimensions").prev("h4").hide();
        }
        if (theMuseumLocation != "") {
            $("#museum-location").text(theMuseumLocation);
        } else {
            $("#museum-location").hide();
            $("#museum-location").prev("h4").hide();
        }
        if (theMuseumNumber != "") {
            $("#museum-number").text(theMuseumNumber);
        } else {
            $("#museum-number").hide();
            $("#museum-number").prev("h4").hide();
        }
        $("#search-terms").text(theReadableSearchTerms);
        SITE.onThrottledResize();
        $(".content-placeholder, .hide-until-loaded").addClass("loaded");
        $("img.image-hide-until-loaded").load(function() {
            $(".image-hide-until-loaded, .hide-after-loaded").addClass("loaded");
        });
    } else if (expectResponse === 3) {
        var historyObjectHTML = "";
        historyObjectHTML += '<div class="history-object hide-until-loaded" data-object-number="' + theHistory[historyCount] + '">';
        historyObjectHTML += '<div class="history-object-image-holder" ';
        historyObjectHTML += "style=\"background-image: url('" + imgUrl + "');\">";
        historyObjectHTML += "</div>";
        historyObjectHTML += '<img src="' + imgUrl + '" class="image-holder-for-loading" id="image-holder-' + historyCount + '" >';
        historyObjectHTML += '<div class="history-object-info">';
        historyObjectHTML += "<p><strong>" + theTitle + "</strong>, " + theDate + "</p>";
        historyObjectHTML += "<p>" + theArtist + "</p>";
        historyObjectHTML += "</div>";
        historyObjectHTML += "</div>";
        $("#history-objects").append(historyObjectHTML);
        $("#image-holder-" + historyCount).on("load", function() {
            $(this).parent().addClass("loaded");
            $(this).remove();
        });
        if (historyCount < maxHistoryItems - 1 && historyCount < theHistory.length - 1) {
            searchCount = 0;
            historyCount++;
            makeVaRequest(theHistory[historyCount], undefined, undefined, undefined, undefined, true);
        } else {
            historyCount = 0;
            searchCount = 0;
            $(".history-wrapper .loading").addClass("loaded");
            $(".history-object").click(function() {
                $(".close-overlay").trigger("click");
                makeVaRequest($(this).data("object-number"));
            });
        }
    }
}

function handleError(jqXHR, status, msg) {
    console.log("Error was: " + msg);
}

start();

var _AnalyticsCode = "UA-87491627-1";

var _gaq = _gaq || [];

_gaq.push([ "_setAccount", _AnalyticsCode ]);

_gaq.push([ "_trackPageview" ]);

(function() {
    var ga = document.createElement("script");
    ga.type = "text/javascript";
    ga.async = true;
    ga.src = "https://ssl.google-analytics.com/ga.js";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(ga, s);
})();

function trackPinterestShare(e) {
    _gaq.push([ "_trackEvent", e.target.id, "pinterest-share" ]);
}

document.addEventListener("DOMContentLoaded", function() {
    var pinButton = document.getElementById("pinterest-button");
    pinButton.addEventListener("click", trackPinterestShare);
});

(function(window, $) {
    var pumkin = window.pumkin = window.pumkin || {};
    var SITE = window.SITE = window.SITE || {};
    $(function() {
        SITE.initGlobal();
        SITE.initMain();
    });
})(this, this.jQuery);
//# sourceMappingURL=scripts.js.map