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
		$sideCaption = $('.object-side-caption');
		$downArrow = $('.down-arrow');
		$panelOpenIcon = $('.panel-open-icon');
		$objectHeader = $('.object-header');
		$creditsOpenBtn = $('.credits');
		$overlayCloseBtn = $('.close-overlay');
		$overlay = $('.overlay');
		
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

		// $('.panel-open-icon').mouseover(function(){
		// 	// $el = $(this).parent();
		// 	$body.addClass('side-panel-hint');
		// });

		// $('.panel-open-icon').mouseout(function(){
		// 	// $el = $(this).parent();
		// 	$body.removeClass('side-panel-hint');
		// });

		$panelOpenIcon.click(function(){
			if ($body.hasClass('side-panel-closed')) {
				$body.removeClass('side-panel-closed').addClass('side-panel-open');
			}
			else {
				$body.removeClass('side-panel-open side-panel-hint').addClass('side-panel-closed');
			}
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

		$creditsOpenBtn.click(function() {
			if ($overlay.hasClass('closed')) {
				$overlay.removeClass('closed').addClass('open');
				$overlay.fadeIn(500);
				// console.log('fadein');
			}
			else {
				$overlay.removeClass('open').addClass('closed');
				$overlay.fadeOut(500);	
			}
		});

		$overlayCloseBtn.click(function() {
			$overlay.removeClass('open').addClass('closed');
			$overlay.fadeOut(500);	
		});

		$('#go-to-options').click(function() {
		  if (chrome.runtime.openOptionsPage) {
		    // New way to open options pages, if supported (Chrome 42+).
		    chrome.runtime.openOptionsPage();
		  } else {
		    // Reasonable fallback.
		    window.open(chrome.runtime.getURL('/src/options/index.html'));
		  }
		});
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
			$sideCaption.addClass('reveal');
		}
		else {
			// hide the caption
			$sideCaption.removeClass('reveal');
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
		console.log('throttle');
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
	


})( this, this.jQuery, this.Modernizr, this.screenfull, this.FastClick );