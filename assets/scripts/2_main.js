;(function ( window, $, Modernizr, screenfull, FastClick ) {
	var pumkin = window.pumkin;
	var SITE = window.SITE = window.SITE || {};

	//define empty page vars
	
	//GLOBAL
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


	// SPECIFIC TO HERE
	
	// FUNCTIONS FROM ELSEWHERE

	function defineVars () {
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

		// SPECIFIC TO HERE
		$textContent = $('.text-content-column');
		$objectCaption = $('.object-caption');
		$downArrow = $('.down-arrow');
		$objectHeader = $('.object-header');
		$sidePanel = $('.side-panel');
		$sidePanelOpenBtn = $('.more');
		$sidePanelCloseBtn = $('.close-side-panel');
		$historyOpenBtn = $('.history');
		$overlayCloseBtn = $('.close-overlay');
		$overlay = $('.overlay');
		$techInfo = $('.technical-info .text-content');
		
		// FUNCTIONS FROM ELSEWHERE
	}


	function initMain () {

		defineVars();

		initFastclick();

		handleClicks();

		// window resize things
		onResize();
		onThrottledResize();
		onDebouncedResize();
		$window.on('resize', onResize);
		$window.on('resize', throttledResize);
		$window.on('resize', debouncedResize);

		onThrottledScroll();
		$textContent.on('scroll', throttledScroll);

		console.log('initMain');
		
	}

	function handleClicks () {

		$sidePanelOpenBtn.click(function(){
			if ($sidePanel.hasClass('open')) {
				$sidePanel.removeClass('open');
			}
			else {
				$sidePanel.addClass('open');
			}
		});

		$sidePanelCloseBtn.click(function(){
			$sidePanel.removeClass('open');
		});

		$downArrow.click(function() {
			console.log('scroll');
			$('.object-text').velocity('scroll', {
	            duration: 700,
	            offset: -100,
	            easing: 'ease-in-out',
	            container: $textContent
	        });
		});

		$historyOpenBtn.click(function() {
			if ($overlay.hasClass('closed')) {
				$overlay.removeClass('closed').addClass('open for-history');
				showHistory();
				$overlay.fadeIn(500);
			}
			else {
				$overlay.removeClass('open for-warning for-history').addClass('closed');
				$overlay.fadeOut(500, function() {
					hideHistory();
				});	
			}
		});

		$overlayCloseBtn.click(function() {
			$overlay.removeClass('open').addClass('closed');
			$overlay.fadeOut(500);	
		});

		$('.go-to-options').click(function() {
		  if (chrome.runtime.openOptionsPage) {
		    // New way to open options pages, if supported (Chrome 42+).
		    chrome.runtime.openOptionsPage();
		  } else {
		    // Reasonable fallback.
		    window.open(chrome.runtime.getURL('/src/options/index.html'));
		  }
		});
	}

	function throwError() {

		$overlay.removeClass('closed').addClass('open for-warning');
		$overlay.fadeIn(500);
	}


	// Object History
	// ----------------------------------------------------

	function showHistory() {

		// $('#history-objects').text(theHistory.toString());

		searchCount = 0; // reset the limit so this doesn't interfere
		makeVaRequest(theHistory[0], undefined, undefined, undefined, undefined, undefined, undefined, undefined, true); // last arg is 'forHistory'

		$('.history-wrapper .loading').addClass('loaded');
	}

	function hideHistory() {

		$('#history-objects').text('');

		('.history-wrapper .loading').removeClass('loaded');

	}
	
	// Scroll events
	// ----------------------------------------------------

	function onThrottledScroll () {

		// console.log('text col scrollstop = '+$('.text-content-column').scrollTop());

		var scrollAmt = $textContent.scrollTop();

		// if ( scrollAmt > HEIGHT*0.85) {
		// 	// hide the arrow
		// 	$downArrow.addClass('hide');
		// }
		// else {	
		// 	// show the arrow
		// 	$downArrow.removeClass('hide');
		// }

		if ( scrollAmt > HEIGHT*0.5) {
			// show the caption
			$objectCaption.addClass('reveal');
		}
		else {
			// hide the caption
			$objectCaption.removeClass('reveal');
		}

		if ( scrollAmt > HEIGHT*0.5) {
			// hide the header
			$objectHeader.addClass('hide');
		}
		else {
			// show the header
			$objectHeader.removeClass('hide');
		}
	}

	var throttledScroll = function() {
		// DO SOMETHING EVERY 250ms
		onThrottledScroll();
		
	};



	// RESIZE SCRIPTS
	// ----------------------------------------------------
	function onResize () { 
	  WIDTH = $window.width();
	  HEIGHT = $window.height();
	}

	function onThrottledResize () {
		
		console.log('tech info height: '+$techInfo.outerHeight(true));
		console.log('window height: '+HEIGHT);

		if ($techInfo.outerHeight(true) < HEIGHT) {
			console.log('throttle: set middle class on');
			$techInfo.addClass('middle');
		} else {
			console.log('throttle: set middle class off');
			$techInfo.removeClass('middle');
		}
	}

	function onDebouncedResize () {
		console.log('debounce');
	}
	  
	var throttledResize = $.throttle(250, function() {
		// DO SOMETHING EVERY 250ms
		onThrottledResize();
		
	});

	var debouncedResize = $.debounce(100, function() {
		onDebouncedResize();	
	});


	// INITIALISE FASTCLICK
	function initFastclick () {
		FastClick.attach(document.body);
	}

	
	// EXPORT
	SITE.initMain = initMain;
	SITE.throwError = throwError;
	SITE.onThrottledResize = onThrottledResize;


})( this, this.jQuery, this.Modernizr, this.screenfull, this.FastClick );