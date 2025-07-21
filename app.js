/**
Core script to handle the entire layout and base functions
**/
var App = function() {
	"use strict";

	// IE mode
	var isIE8 = false;
	var isIE9 = false;
	var isIE10 = false;

	var handleResponsive = function() {
		var isIE8 = ( navigator.userAgent.match(/msie [8]/i) );
		var isIE9 = ( navigator.userAgent.match(/msie [9]/i) );
		var isIE10 = !! navigator.userAgent.match(/MSIE 10/);

		// if (isIE10) {
		// 	$('html').addClass('ie10'); // detect IE10 version
		// }

		// $('.navbar li.nav-toggle').click(function() {
		// 	$('body').toggleClass('nav-open');
		// });

		/**
		 * Sidebar-Toggle-Button
		 */

		$('.toggle-sidebar').click(function(e) {
			e.preventDefault();

			// Toggle class
			$('#container').toggleClass('sidebar-closed');
			if ($('#container').hasClass('sidebar-closed')) {
				handleElements()
				resetResizeableSidebar()
			} else {
				handleElements()
			}
		});

		/**
		 * Top-Left-Menu-Toggle-Button
		 */

		// $('.toggle-top-left-menu').click(function(e) {
		// 	e.preventDefault();

		// 	// Toggle visibility
		// 	$('.navbar-left.navbar-left-responsive').slideToggle(200);
		// });

		var handleElements = function() {
			// First visible childs add .first
			$('.crumbs .crumb-buttons > li').removeClass('first');
			$('.crumbs .crumb-buttons > li:visible:first').addClass('first');

			// Remove phone-navigation
			if ($('body').hasClass('nav-open')) {
				$('body').toggleClass('nav-open');
			}

			// Set default visibility state
			$('.navbar-left.navbar-left-responsive').removeAttr('style');

			$('#sidebar').css("width", "");
			$('#main').css("margin-left", "");
			$('body').css("background", "#e3e5e7 url(\"../img/mt_icons/app/nav-bg.png\") repeat-y scroll left top");
			$('#container').removeClass('sidebar-closed');


			// Add additional scrollbars
			// handleScrollbars();

			// // Handle project switcher width
			// handleProjectSwitcherWidth();
		}

		// handles responsive breakpoints.
		$(window).setBreakpoints({
			breakpoints: [320, 480, 768, 979, 1200]
		});

		$(window).bind('exitBreakpoint320', function() {
			handleElements();
		});
		$(window).bind('enterBreakpoint320', function() {
			handleElements();

			resetResizeableSidebar();
		});

		$(window).bind('exitBreakpoint480', function() {
			handleElements();
		});
		$(window).bind('enterBreakpoint480', function() {
			handleElements();

			resetResizeableSidebar();
		});

		$(window).bind('exitBreakpoint768', function() {
			handleElements();
		});
		$(window).bind('enterBreakpoint768', function() {
			handleElements();

			resetResizeableSidebar();
		});

		$(window).bind('exitBreakpoint979', function() {
			handleElements();
		});
		$(window).bind('enterBreakpoint979', function() {
			handleElements();
		});

		$(window).bind('exitBreakpoint1200', function() {
			handleElements();
		});
		$(window).bind('enterBreakpoint1200', function() {
			handleElements();
		});
	};

	// var handleScrollbars = function() {
	// 	var android_chrome = /android.*chrom(e|ium)/.test(navigator.userAgent.toLowerCase());

	// 	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) && android_chrome == false) {
	// 		$('#sidebar').css('overflow-y', 'auto');
	// 	} else {
	// 		if ($('#sidebar').hasClass('sidebar-fixed') || $(window).width() <= 767) {

	// 			// Since Chrome on Android has problems with scrolling only in sidebar,
	// 			// this is a workaround for this
	// 			//
	// 			// Awaiting update from Google

	// 			if (android_chrome && !$('#sidebar').hasClass('sidebar-fixed-responsive')) {
	// 				var wheelStepInt = 100;
	// 				$('#sidebar').attr('style', 'position: absolute !important;');

	// 				// Fix for really high tablet resolutions
	// 				if ($(window).width() > 979) {
	// 					$('#sidebar').css('margin-top', '-52px');
	// 				}

	// 				// Only hide sidebar on phones
	// 				if ($(window).width() <= 767) {
	// 					$('#sidebar').css('margin-left', '-250px').css('margin-top', '-52px');
	// 				}
	// 			} else {
	// 				var wheelStepInt = 7;

	// 				$('#sidebar-content').slimscroll({
	// 					'height': '100%',
	// 					wheelStep: wheelStepInt
	// 				});
	// 			}
	// 		}
	// 	}
	// }

	// /**
	//  * Calculates project switcher width
	//  */
	// var handleProjectSwitcherWidth = function() {
	// 	$('.project-switcher').each(function () {
	// 		// To fix the hidden-width()-bug
	// 		var $projectswitcher = $(this);
	// 		$projectswitcher.css('position', 'absolute').css('margin-top', '-1000px').show();

	// 		// Iterate through each li
	// 		var total_width = 0;
	// 		$('ul li', this).each(function() {
	// 			total_width += $(this).outerWidth(true) + 15;
	// 		});

	// 		// And finally hide it again
	// 		$projectswitcher.css('position', 'relative').css('margin-top', '0').hide();

	// 		$('ul', this).width(total_width);
	// 	});
	// }

	/**
	 * Removes the CSS-styles added with jQuery while resizing the sidebar
	 */
	var resetResizeableSidebar = function() {
		$('#sidebar').css("width", "0px");
		$('#main').css("margin-left", "0px");
		$('body').css("background", "#e3e5e7 repeat-y scroll left top");
		$('#container').removeClass('sidebar-closed').addClass('sidebar-closed');

	}

	return {
		//main function to initiate template pages
		init: function() {
			//core handlers
			handleResponsive(); // Checks for IE-version, click-handler for sidebar-toggle-button, Breakpoints
			// handleScrollbars(); // Adds styled scrollbars for sidebar on desktops

			// handleLayout(); // Calls calculateHeight()
			// handleResizeEvents(); // Calls _resizeEvents() every 30ms on resizing
			// handleSwipeEvents(); // Enables feature to swipe to the left or right on mobile phones to open the sidebar
			// handleSidebarMenu(); // Handles navigation
			// handleThemeSwitcher(); // Bright/ Dark Switcher
			// handleWidgets(); // Handle collapse and expand from widgets
			// handleCheckableTables(); // Checks all checkboxes in a table if master checkbox was toggled
			// handleTabs(); // Fixes tab height
			// handleScrollers(); // Initializes slimscroll for scrollable widgets
			// handleProjectSwitcher(); // Adds functionality for project switcher at the header
		}
	};
}()