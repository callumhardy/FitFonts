/**
 *
 * TypeSizer Plugin
 * 
 *    ___       ___       ___       ___       ___       ___       ___       ___       ___   
 *   /\  \     /\  \     /\__\     /\  \     /\  \     /\  \     /\  \     /\  \     /\  \  
 *  /::\  \   /::\  \   /:| _|_    \:\  \   /::\  \   _\:\  \   _\:\  \   /::\  \   /::\  \ 
 * /::\:\__\ /:/\:\__\ /::|/\__\   /::\__\ /\:\:\__\ /\/::\__\ /::::\__\ /::\:\__\ /::\:\__\
 * \/\:\/__/ \:\/:/  / \/|::/  /  /:/\/__/ \:\:\/__/ \::/\/__/ \::;;/__/ \:\:\/  / \;:::/  /
 *    \/__/   \::/  /    |:/  /   \/__/     \::/  /   \:\__\    \:\__\    \:\/  /   |:\/__/ 
 *             \/__/     \/__/               \/__/     \/__/     \/__/     \/__/     \|__|  
 *
 * Author: Callum Hardy <callum@ed.com.au>
 *
 * Version: 1.0
 *
 * ascii: smisome1
 * 
 */

/**
 * Fall back for older browsers that don't support Object.create
 */
if( typeof Object.create !== 'function' ) {

	Object.create = function( object ) {

		function Obj(){}
		Obj.prototype = object;
		return new Obj();
	};
}

/**
 * Fall back for older browsers that don't support Object.keys
 */
if (!Object.keys) {

  Object.keys = function(obj) {

    var keys = [];

    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        keys.push(i);
      }
    }

    return keys;
  };
}

/**
 * Anonymous function
 */
(function( $, window, document, undefined ) {

	/**
	 * Global variables
	 */
	$window = $(window);
	var windowWidth = $window.innerWidth(),
		windowHeight = $window.innerHeight();

	/**
	 * The default arguments for the typeSizer function
	 * @type {Object}
	 */
	var defaultArgs = {

		lineHeight: 1.2,

		center: false,

		maxFontSize: 9999,

		minFontSize: 1,

		averageLines: false,

		debug: false,

		/**
		 * before
		 */
		before: function(){},

		/**
		 * after
		 */
		after: function(){}

	};/* defaultArgs */



	/**
	 * Run this function on a jQuery element to manipulate selected images within
	 * @param  {Object}		configArgs		Configurable arguments can be passed to override the defaults
	 * @return {Object}						The jQuery object that this function is run on
	 */
	$.fn.typeSizer = function( configArgs ) {

		//	Merge/Overwrite the default and config arguments
		var config = $.extend( {}, defaultArgs, configArgs );

		//	Get the containers
		$containers = $(this);

		//	If there are conainers loop through them
		if( $containers.length > 0 ){

			$containers.each(function(){

				$container = $(this);

				// console.log(config.debug);

				var text = $container.text(),
					elements = {};

				$text = $('<div>').text( text );

				$text.css({
					lineHeight: config.lineHeight,
					display: 'inline-block'
				});

				$container.text('').append(
					$text
				);

				if( config.debug )
					$container.append( $('<div>').addClass('debug') );

				//	Store the elements
				elements.$container = $container;
				elements.$text = $text;

				//	Create the typeSizer object
				var typeSizer = Object.create( TypeSizer );

				//	Run the TypeSizer Object
				typeSizer.init( config, elements );

			});/* $containers.each */

		}/* if( $containers.length > 0 ) */

		//	return the original jQuery object
		return $containers;

	};/* $.fn.typeSizer */


	/**
	 * stretches images inside a container to fit based on user configuration options
	 */
	var TypeSizer = {

		/**
		 * @param [Object] config "User configuration options"
		 *
		 * @return [Object]	"The TypeSizer Object"
		 */
		init: function( config, elements ) {

			var self = this;

			//	Store the config in the TypeSizer object
			self.config = config;

			//	Store the elements
			self.elements = elements;

			//	Run the initial stretching
			self.typeResize();

			//	Setup the bind events
			self.bindEvents();

			return self;

		},

		/**
		 * This method runs through select while loops and forces the text to fit inside a container element
		 * 
		 * @return [Object]	"The TypeSizer Object"
		 */
		typeResize: function() {

			var self = this,
				config = self.config,
				windowWidth = $window.innerWidth();

			$container = self.elements.$container;
			$text = self.elements.$text;

			//	Callback: before
			config.before();

			var containerWidth = $container.width(),
				containerHeight = $container.innerHeight(),
				textWidth = $text.width(),
				textHeight = $text.innerHeight(),
				textCurrentLines = 1,
				textMaxLines = 1,
				textFontSize = parseInt($text.css('font-size'),10),
				textLineHeight = parseInt($text.css('line-height'),10),
				action = null,
				count = 1;

			//	Update all variables
			function updateVars() {

				//	Vars
				textFontSize = parseInt($text.css('font-size'),10);
				textLineHeight = parseInt($text.css('line-height'),10);
				textMaxLines = Math.floor( $container.height() / textFontSize );
				textCurrentLines = $text.height() / textFontSize;

				//	Display / Update the Debug info
				if( self.config.debug ) {

					$container.find('.debug').text('');

					var debugUnits = {
						textHeight: $text.height(),
						textFontSize: textFontSize,
						textMaxLines: textMaxLines,
						textCurrentLines: textCurrentLines,
						count: count,
						action: action
					}

					$.each( debugUnits, function(name,value){
						$container.find('.debug').append(
							name + ': ' + value + '</br>'
						);
					});

				}

				//	increment the counter
				count++;

			}

			//	Reset the inline width of the text before we go about sizing it
			$text.css('width','');

			//	Setting up the initial variables to test the text size with
			updateVars();

			//	Does the text need to be Enlarged?
			if( $container.height() > $text.innerHeight()  ) {

				action = 'Enlarge';

				while( textCurrentLines <= textMaxLines && textFontSize <= config.maxFontSize && count < 9999 ) {

					//	Enlarge the text by 1
					$text.css('font-size','+=1');

					updateVars();

				}

				//	Now that we've exited the while loop we need to shrink the text by 1
				//	This is because the while loop breaks when the text is to many lines high, so shrinking it make it the correct amount of line
				$text.css('font-size','-=1');

				updateVars();

			//	Else the text needs to shrink...
			} else {

				action = 'Shrink';

				while( textCurrentLines > textMaxLines && textFontSize >= config.minFontSize && count < 9999 ) {

					//	Shrink the text by 1
					$text.css('font-size','-=1');

					updateVars();

				}

				//	Now that the while loop has ended we need to reduce it once more
				//	just to be sure it fits in some extream cases
				$text.css('font-size','-=1');

				updateVars();

			}

			//	After making sure the text fits the heigh of the container
			//	We now check that the width is okay
			//	For example there might be a really long word that makes the text div wider than the container
			if( $text.innerWidth() > $container.width() ) {

				count = 1;

				action = 'Shrink';

				while( $text.innerWidth() > $container.width() && textFontSize > config.minFontSize && count < 100 ) {

					$text.css('font-size','-=1');

					updateVars();

				}

			}

			//	Store the current amount of lines that the text spans
			var textLines = textCurrentLines;

			//	Set an inline width on the text
			$text.css('width',$container.width());

			//	Here we are reducing the width of the text until the lines are average in length
			if( config.averageLines ) {

				count = 1;

				action = 'Averaging';

				while( textLines == textCurrentLines && count < 9999 ) {

					$text.css('width','-=1');

					updateVars();

				}

				$text.css('width','+=1');

			}

			//	Centering the text
			if( config.center ) {

				var textMarginTop = ( $container.height() - $text.innerHeight() ) / 2,
					textMarginLeft = ( $container.innerWidth() - $text.width() ) / 2

				$text.css({
					marginTop: textMarginTop,
					// marginLeft: textMarginLeft
				});

			}
			
			//	Callback: after
			config.after();

			return self;

		},

		/**
		 * @return [Object]	"The TypeSizer Object"
		 */
		bindEvents: function() {

			var self = this,
				resizing;

			//	Window Resize
			$window.resize(function() {

				//	Clear the current timeout
				clearTimeout(resizing);

				//	typeResize after 50ms
				resizing = setTimeout( function() {

					self.typeResize();

				}, 100);
			});

			//	Resize when window tab is focussed
			//	Trying to stop a bug that occasionally appears when another tab is focussed when the browser is typeSizer
			$window.on( 'focus', function() {

				self.typeResize();

			});

			//	Trigger Event
			self.elements.$container.on( 'typeResize', function() {

				self.typeResize();

			});

			return self;
		}

	};

})( jQuery, window, document );
