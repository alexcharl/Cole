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
		
		// FUNCTIONS FROM ELSEWHERE
	}


	function initMain () {

		defineVars();

		initFastclick();

		// window resize things
		onResize();
		onThrottledResize();
		onDebouncedResize();
		$window.on('resize', onResize);
		$window.on('resize', throttledResize);
		$window.on('resize', debouncedResize);

		console.log('initMain');
		
	}


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