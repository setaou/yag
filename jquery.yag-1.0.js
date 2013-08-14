/*******************************************************************************
*                        Yet Another Galley for jQuery                         *
*******************************************************************************/

/*!
    Yet Another Gallery for jQuery (aka YAG) 1.0
    Copyright (C) 2008-9  Hervé "Setaou" BRY (setaou at setaou dot net)
    http://www.setaou.net

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

(function () {

//-------------------------------------------------------
// YAG Class
//-------------------------------------------------------

/**********************************
* Constructor                     *
**********************************/
YAG = window.YAG = function (ul, options) {
    ul = $(ul);

    /**********************************
    * Default options                 *
    **********************************/

    var defaults = {
        viewportPosition: 'top',              // 'top', 'bottom'
        infoBoxPosition: 'bottom',            // 'top', 'bottom'
        infoBoxOpacity: .8,                   // Number between 0 and 1
        infoBoxAutoShow: 'normal',            // 'full', 'normal', 'no'
        infoBoxAutoHideDelay: 5000,           // Delay in ms
        buttonsFade: true,                    // boolean
        buttonsFadeDuration: 200,             // Duration in ms
        spinnersFade: true,                   // boolean
        spinnersFadeDuration: 200,            // Duration in ms
        transitionDuration: 1500,             // Duration in ms
        centerThumbnails: true,               // boolean
        squareThumbnails: false,              // boolean
        thumbnailsOpacity: .5,                // Number between 0 and 1
        thumbnailsFadeDuration: 200,          // Duration in ms
        realSizeOverlayOpacity: .8,          // Number between 0 and 1
        realSizeFadeDuration: 1000            // Duration in ms
    };
    this.options = $.extend(defaults, options || {});

    /**********************************
    * Creation of DOM objects         *
    **********************************/

    if (ul.length != 1)
        throw new String("Only one element should be given to the gallery constructor. To create several galleries at a time, use $(selector).YAG(options).");
    else if (ul.get(0).tagName != 'UL')
        throw new String("The element given to the gallery constructor is not an unordered list (UL).");
    else if (ul.find("li a img").length == 0)
        throw new String("The element does not match the needed structure (UL > LI > A > IMG).");
    else if (!!(ul.get(0).YAG))
        throw new String("A YAG gallery has already been created for that element.");

    var gallery = ul.get(0).YAG = this;

    // Gallery DIV container
    ul.wrap($("<div></div>"));
    var root = gallery.root = ul.parent();

    root.get(0).className = ul.get(0).className;
    ul.get(0).className = "";

    // Thumbnails
    root.find("ul").css({width: 1000000});
    root.find("ul").wrap($("<div></div>").addClass('YAG-thumbs'));

    root.find("ul").css('visibility', 'hidden');
    root.find("li img").css('opacity', gallery.options.thumbnailsOpacity);

    // Buttons
    root.find(".YAG-thumbs").prepend($("<div></div>").css({display: 'none'}).addClass('YAG-button-forward'));
    root.find(".YAG-thumbs").prepend($("<div></div>").css({display: 'none'}).addClass('YAG-button-backward'));
    if (this.options.buttonsFade)
        root.find(".YAG-button-backward,.YAG-button-forward").css({opacity: 0});

    // Viewport & InfoBox
    var viewport = $("<div></div>").addClass("YAG-viewport");
    var infobox = $("<div></div>").addClass("YAG-infobox");
    var infoboxContent = $("<div></div>").addClass("YAG-infobox-content");
    var infoboxOverlay = $("<div></div>").addClass("YAG-infobox-overlay");
    var infoboxTitle = $("<div></div>").addClass("YAG-title");
    var infoboxDescription = $("<div></div>").addClass("YAG-description");
    infoboxOverlay.css('opacity', this.options.infoBoxOpacity).appendTo(infobox);
    infoboxContent.appendTo(infobox);

    if (this.options.infoBoxPosition == 'bottom')
        infoboxContent.append(infoboxTitle).append(infoboxDescription);
    else
        infoboxContent.append(infoboxDescription).append(infoboxTitle);

    infobox.prependTo(viewport);

    if (this.options.viewportPosition == 'bottom')
        root.append(viewport);
    else
        root.prepend(viewport);

    if (this.options.infoBoxPosition == 'bottom')
        infobox.css({top: infobox.parent().height()});
    else
        infobox.css({bottom: infobox.parent().height()});

    // Thumbnails Spinner
    showSpinner(root.find(".YAG-thumbs"), this.options.spinnersFade, this.options.spinnersFadeDuration);

    /**********************************
    * Events callbacks                *
    **********************************/

    // If the mouse wheel plugin is loaded, register mouse wheel events
    if ($().mousewheel)
    {
        root.find("ul").mousewheel(function(event, delta) {
            gallery.slide(-Math.ceil(delta));
            return false;
        }, false, true);
    }

    // Left and Right keyboard keys
    root.find("ul").keydown(function(event) {
        switch (event.which)
        {
            case 32: // Space
                gallery.show($(this).children("li.YAG-current").next());
                return false;
                break;

    	    case 35: // End
                gallery.show($(this).children("li:last"));
                return false;
                break;

    	    case 36: // Origin
                YAG.show($(this).children("li:first"));
                return false;
                break;

    	    case 37: // Left
                gallery.show($(this).children("li.YAG-current").prev());
                return false;
                break;

            case 39: // Right
                gallery.show($(this).children("li.YAG-current").next());
                return false;
                break;
        }
    });

    // Thumbnails hover
    root.find("li").hover(
        function() {
            $(this).not(".YAG-current").find("img").stop(true).animate({ opacity:'1'}, gallery.options.thumbnailsFadeDuration);
        },
        function() {
            $(this).not(".YAG-current").find("img").animate({ opacity: gallery.options.thumbnailsOpacity}, gallery.options.thumbnailsFadeDuration);
        }
    );

    // Thumbnails click
    root.find("li").click(function() {
        gallery.show(this);
        return false;
    });

    // Backward button click
    root.find("div.YAG-button-backward").click(function() {
        gallery.slide(-5);
        return false;
    });

    // Forward button click
    root.find("div.YAG-button-forward").click(function() {
        gallery.slide(+5);
        return false;
    });

    // Viewport resize
    root.find(".YAG-viewport").resize(function() {
        var img = $(this).find("img:last");

        gallery.slide(0);
        fit(img);
        center(img);
    });

    // Viewport hover = display the small infobox
    root.find(".YAG-viewport").hover(
        function () { gallery.showInfoBox(); }
    ,
        function () { gallery.showInfoBox('hide'); }
    );

    // Infobox hover = display the full infobox
    root.find(".YAG-infobox").hover(
        function () { gallery.showInfoBox('full'); }
    ,
        function () { gallery.showInfoBox(); }
    );

    /**********************************
    * Variables initialisation        *
    **********************************/

    this._position = 0;
    this._infoBoxEnabled = false;

    /**********************************
    * When all thumbnails are loaded, *
    * initialize the gallery          *
    **********************************/

    var waitUntillLoaded = function () {
        if (gallery._checkThumbnailsLoaded())
        {
            gallery._layoutThumbnails();   // Layout thumbnails
            gallery.show(0);               // Display the first picture
        }
        else
            setTimeout(waitUntillLoaded, 200);
    };
    waitUntillLoaded();
}

/**********************************
* Prototype                       *
**********************************/
YAG.prototype = {
    next: function (cycle)
    {
        var next = this.root.find("li.YAG-current").next();

        if (next.length == 0)
        {
            if (cycle)
                next = this.root.find("li:first");
            else
                return;
        }

        this.show(next);
    },

    previous: function (cycle)
    {
        var previous = this.root.find("li.YAG-current").prev();

        if (previous.length == 0)
        {
            if (cycle)
                previous = this.root.find("li:last");
            else
                return;
        }

        this.show(previous);
    },

    slide: function (offset)
    {
        var total_thumbs = this.root.find("li").length;
        var gal_width = this.root.find(".YAG-thumbs").width();
        var lastThumb = this.root.find("li:last");
        var divWidth = lastThumb.position().left + lastThumb.outerWidth();

        // Calculate the new position
        var pos = this._position + offset;

        if (pos < 0)
            pos = 0;
        else if (pos >= total_thumbs)
            pos = total_thumbs - 1;

        this._position = pos;

        // Calculate the new offset
        var element = this.root.find("li").eq(pos);
        var offset = gal_width / 2 - element.position().left - element.outerWidth() / 2;

        if (offset > 0)
            offset = 0;
        else if (offset < gal_width - divWidth)
            offset = gal_width - divWidth;

        // Enable/disable buttons
        var backward = (offset < 0) ? 1 : 0;
        var forward = (offset > gal_width - divWidth) ? 1 : 0;
        this._enableButtons(backward, forward);

        // Animate
        this.root.find(".YAG-thumbs ul").stop().animate({ left: offset }, 'slow');
    },

    slideTo: function (thumb)
    {
        var new_pos = (typeof thumb == "number") ? thumb : $(thumb).prevAll().length;
        var offset = new_pos - this._position;

        this.slide(offset);
    },

    show: function (thumb)
    {
        if (typeof thumb == "number")
            thumb = this.root.find("li").get(thumb);

        var gallery = this;

        var viewport = this.root.children(".YAG-viewport");
        var infobox = $(viewport).children(".YAG-infobox");

        var url = $(thumb).find("a").attr("href");
        var title = $(thumb).find("img").attr("title");
        var longdesc = $(thumb).find("img").attr("longdesc");

        //If the picture is already (being) displayed, return
        if (viewport.children("img:last").attr("src") == url)
            return;

        // Set the opacity for the thumbnail of the current picture and reset it for the previous
        $(thumb).siblings(".YAG-current").removeClass("YAG-current").find("img").animate({ opacity: this.options.thumbnailsOpacity}, this.options.thumbnailsFadeDuration);
        $(thumb).addClass("YAG-current").find("img").animate({opacity: '1'}, 'fast');

        // Slide the gallery so that the thumbnail of the current picture is in the center
        this.slideTo(thumb);

        // Show the spinner
        showSpinner(viewport, gallery.options.spinnersFade, gallery.options.spinnersFadeDuration);

        // Disable load events for every picture that may be loading
        viewport.children("img").unbind("load");

        // Create the new picture
        var img = $("<img />").css({opacity: 0, position: 'absolute', cursor: 'pointer'}).appendTo(viewport);
        img.bind("load", function() {
            // Hide the spinner
            hideSpinner(viewport, gallery.options.spinnersFade, gallery.options.spinnersFadeDuration);

            // Fade out and delete previous pictures
            $(this).siblings("img").stop().animate({opacity: 0}, gallery.options.transitionDuration, '', function() {
                $(this).remove();
            });

            fit(this);
            center(this);

            // Fade in
            $(this).animate({opacity: 1}, gallery.options.transitionDuration);

            // Update Infobox
            gallery._enableInfoBox(false);
            gallery.showInfoBox('hide', function () { // Called back when the info box has been hidden
                infobox.find(".YAG-title").text(title);

                if ((longdesc != null) && (longdesc.length != ""))
                {
                    $.get(longdesc, function (data) { // Called back when the longdesc data has been fetched
                        infobox.find(".YAG-description").html(data);
                        gallery._enableInfoBox(true);
                        if (gallery.options.infoBoxAutoShow != 'no')
                        {
                            gallery.showInfoBox(gallery.options.infoBoxAutoShow, function () { // Called back when the info box has been shown
                                // Set a new timer to hide back the infobox after 5s
                                infobox.get(0).autoHide = setTimeout(function () { // Called back after 5s
                                    gallery.showInfoBox('hide');
                                }, gallery.options.infoBoxAutoHideDelay);
                            });
                        }
                    });
                }
                else
                {
                    // *Ugly hack*: There is a problem of context with $().stop() in showInfoBox() here...
                    // I cant find it so I have to isolate this part of the code using setTimeout.
                    // I suspect a bug of jQuery...
                    // If someone can debug this I would be happy to know about the solution !
                    setTimeout(function () {
                        infobox.find(".YAG-description").html("");
                        gallery._enableInfoBox(true);
                        if (gallery.options.infoBoxAutoShow != 'no')
                        {
                            gallery.showInfoBox(gallery.options.infoBoxAutoShow, function () { // Called back when the info box has been shown
                                // Set a new timer to hide back the infobox after 5s
                                infobox.get(0).autoHide = setTimeout(function () { // Called back after 5s
                                    gallery.showInfoBox('hide');
                                }, gallery.options.infoBoxAutoHideDelay);
                            });
                        }
                    }, 0);
                }

            });
        });
        img.attr("src", url);

        this.currentIndex = $(thumb).prevAll().length;

        // Click event
        img.click(function () {
            gallery.realSize();
        });
    },

    _checkThumbnailsLoaded: function ()
    {
        // Get thumbs
        var imgs = this.root.find(".YAG-thumbs img").get();

        // Count thumbs that are already loaded
        var loaded = 0;
        for (var i = 0; i < imgs.length; i++)
        {
            // Use "readyState" for compatibility with IE, which does not update "complete" when it should
            if (imgs[i].complete || imgs[i].readyState == 'complete')
                loaded++;
        }

        // If thumbs are all loaded and gallery is not ready, run the layout procedure
        if (loaded == imgs.length)
            return true;
        else
            return false;
    },

    _layoutThumbnails: function ()
    {
        var height = 0, width = 0;

        // Get thumbs
        var imgs = this.root.find(".YAG-thumbs img").get();

        // Calculate the maximum size of the thumbails
        for (var i = 0; i < imgs.length; i++)
        {
            var _img = $(imgs[i]);

            var h = _img.height();
            var w = _img.width();

            if (h > height) height = h;
            if (w > width) width = w;
        }

        // Resize every LI to the same size
        var li = this.root.find("li");
        li.height(height);
        if (this.options.squareThumbnails) li.width(width)

        if (this.options.centerThumbnails)
        {
            // Center thumbails in their parent (LI)
            for (var i = 0; i < imgs.length; i++)
                center(imgs[i]);
        }

        // Display thumbnails
        this.root.find(".YAG-thumbs ul").css('visibility', 'visible');

        // Hide the thumbnails spinner
        hideSpinner(this.root.find(".YAG-thumbs"), this.options.spinnersFade, this.options.spinnersFadeDuration);
    },

    realSize: function ()
    {
        var gallery = this;

        // Overall container
        var container = $("<div></div>").addClass("YAG-realsize").prependTo("body");

        // Overlay
        var overlay = $("<div></div>").css({
            opacity: this.options.realSizeOverlayOpacity,
            height: $(document).height(),
            width: $(document).width(),
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'none'
        }).addClass("YAG-overlay").appendTo(container);

        // Picture frame
        var frame = $("<div></div>").css({
            position: 'absolute',
            display: 'none'
        }).addClass("YAG-frame").appendTo(container);

        // Picture
        var img = this.root.find(".YAG-viewport>img:last").clone().css({
            width: 'auto',
            height: 'auto',
            position: 'static',
            opacity: 1
        }).appendTo(frame);

        // Title
        var title = this.root.find(".YAG-title").clone().appendTo(frame);

        // Center frame into the window
        centerInWindow(frame);

        // Clicking on the picture closes everything
        img.click(function () {
            $(this).parent().fadeOut(gallery.options.realSizeFadeDuration / 2).queue(function () {
                $(this).parent().fadeOut(gallery.options.realSizeFadeDuration / 2).queue(function () {
                    $(this).dequeue().remove();
                });
                $(this).dequeue();
            });
        });

        // Clicking on the overlay closes everything too
        overlay.click(function () {
            $(this).parent().find("img").click();
        });

        // Display the overlay and the frame
        overlay.fadeIn(gallery.options.realSizeFadeDuration / 2).queue(function () {
            $(this).siblings().fadeIn(gallery.options.realSizeFadeDuration / 2);
            $(this).dequeue();
        });
    },

    _enableInfoBox: function (enabled)
    {
        this._infoBoxEnabled = enabled;
    },

    showInfoBox: function (state, callback)
    {
        state = state || 'normal'; // 'normal', 'full', 'hide'

        var infobox = this.root.find(".YAG-infobox");
        var enabled = this._infoBoxEnabled;
        var offset = 0;

        clearTimeout(infobox.get(0).autoHide);

        if ((state == 'full') && (infobox.find(".YAG-description").html().length != 0))
        {
            if (!enabled) return;
            offset = infobox.find(".YAG-title").outerHeight() + infobox.find(".YAG-description").outerHeight();
        }
        else if ((state != 'hide') && (infobox.find(".YAG-title").text().length != 0))
        {
            if (!enabled) return;
            offset = infobox.find(".YAG-title").outerHeight();
        }

        if (this.options.infoBoxPosition == 'bottom')
            infobox.stop(true).animate({top: infobox.parent().height() - offset}, 'fast', null, callback);
        else
            infobox.stop(true).animate({bottom: infobox.parent().height() - offset}, 'fast', null, callback);
    },

    _enableButtons: function (backward, forward)
    {
        if (this.options.buttonsFade)
        {
            if (backward)
                this.root.find(".YAG-button-backward").stop(true).css({display: 'block'}).animate({opacity: 1}, this.options.buttonsFadeDuration);
            else
                this.root.find(".YAG-button-backward").stop(true).animate({opacity: 0}, this.options.buttonsFadeDuration, null, function () { $(this).css({display: 'none'}); });

            if (forward)
                this.root.find(".YAG-button-forward").stop(true).css({display: 'block'}).animate({opacity: 1}, this.options.buttonsFadeDuration);
            else
                this.root.find(".YAG-button-forward").stop(true).animate({opacity: 0}, this.options.buttonsFadeDuration, null, function () { $(this).css({display: 'none'}); });
        }
        else
        {
            this.root.find(".YAG-button-backward").css({display: backward ? 'block' : 'none'});
            this.root.find(".YAG-button-forward").css({display: forward ? 'block' : 'none'});
        }
    }
}

/**********************************
* jQuery extension                *
**********************************/

$.fn.YAG = function(options)
{
    var galleries = new Array();

    this.each(function () {
        galleries.push(new YAG(this, options));
    });

    return galleries;
}

//-------------------------------------------------------
// Support functions
//-------------------------------------------------------

// Center an object in his parent
function center(obj)
{
    var _object = $(obj);
    var _parent = _object.parents(":not(a):first");

    _object.css({
        left: _parent.width() / 2 - _object.outerWidth(true) / 2 ,
        top: _parent.height() / 2 - _object.outerHeight(true) / 2
    });
}

// Center an object in the browser viewport
function centerInWindow(obj)
{
    var _object = $(obj);
    var _document = $(document);

    _object.css({
        left: getViewportSize().width / 2 - _object.outerWidth() / 2 + _document.scrollLeft(),
        top: getViewportSize().height / 2 - _object.outerHeight() / 2 + _document.scrollTop()
    });
}

// Resize an object so that it fits into his parent
function fit(obj, upscale)
{
    var _object = $(obj);
    var p = _object.parents(":not(a):first");

    var margin_top = parseFloat(0 + _object.css("margin-top"));
    var margin_bottom = parseFloat(0 + _object.css("margin-bottom"));
    var margin_left = parseFloat(0 + _object.css("margin-left"));
    var margin_right = parseFloat(0 + _object.css("margin-right"));

    if (!(_object.data("realHeight")))
        _object.data("realHeight", _object.height()).data("realWidth", _object.width());

    var fact_w = p.innerWidth() / _object.data("realWidth");
    var fact_h = p.innerHeight() / _object.data("realHeight");
    var fact = Math.min(fact_w, fact_h);

    if ((fact > 1) && !upscale) fact = 1; // Avoid upscale

    if (fact == fact_h)
        _object.height(_object.data("realHeight") * fact - margin_top - margin_bottom);
    else
        _object.width(_object.data("realWidth") * fact - margin_left - margin_right);
}

// Return the size of the *browser* viewport
getViewportSize = function ()
{
    // Normal browsers
    if (typeof window.innerWidth != 'undefined')
        return {width: window.innerWidth, height: window.innerHeight};
    // IE6
    else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0)
        return {width: document.documentElement.clientWidth, height: document.documentElement.clientHeight};
    // Older
    else
        return {width: document.getElementsByTagName('body')[0].clientWidth, height: document.getElementsByTagName('body')[0].clientHeight};
}

// Display a spinner in the given object
function showSpinner(obj, fade, fadeDuration) {
	if ($(obj).children(".YAG-spinner").length != 0) return;

    var spinner = $("<div />").addClass("YAG-spinner");
    if (fade) spinner.css({opacity: 0});
    $(obj).prepend(spinner);
    if (fade) spinner.stop(true).animate({opacity: 1}, fadeDuration || 'fast');
}

// Hide and delete the spinner in the given object
function hideSpinner(obj, fade, fadeDuration) {
    var spinner = $(obj).children(".YAG-spinner");
    if (fade)
    {
        spinner.stop(true).animate({opacity: 0}, fadeDuration || 'fast', null, function () {
            $(this).remove();
        });
    }
    else
        spinner.remove();
}

})();


/*******************************************************************************
*                         jQuery Mousewheel Extension                          *
*******************************************************************************/

/*! jQuery Mousewheel Extension
*
* Copyright (c) 2008 Brandon Aaron (http://brandonaaron.net)
* Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
* and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
* Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
* Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
*
* Version: 3.0.1-pre
*
* Requires: 1.2.2+
*/

(function($) {

$.event.special.mousewheel = {
  setup: function() {
    var handler = $.event.special.mousewheel.handler;

    // Fix pageX, pageY, clientX and clientY for mozilla
    if ( $.browser.mozilla )
      $(this).bind('mousemove.mousewheel', function(event) {
        $.data(this, 'mwcursorposdata', {
          pageX: event.pageX,
          pageY: event.pageY,
          clientX: event.clientX,
          clientY: event.clientY
        });
      });

    if ( this.addEventListener )
      this.addEventListener( ($.browser.mozilla ? 'DOMMouseScroll' : 'mousewheel'), handler, false);
    else
      this.onmousewheel = handler;
  },

  teardown: function() {
    var handler = $.event.special.mousewheel.handler;

    $(this).unbind('mousemove.mousewheel');

    if ( this.removeEventListener )
      this.removeEventListener( ($.browser.mozilla ? 'DOMMouseScroll' : 'mousewheel'), handler, false);
    else
      this.onmousewheel = function(){};

    $.removeData(this, 'mwcursorposdata');
  },

  handler: function(event) {
    var args = Array.prototype.slice.call( arguments, 1 );

    event = $.event.fix(event || window.event);
    // Get correct pageX, pageY, clientX and clientY for mozilla
    $.extend( event, $.data(this, 'mwcursorposdata') || {} );
    var delta = 0, returnValue = true;

    if (event.wheelDelta)
    {
        if ($.browser.msie) delta = event.wheelDelta /= 30; // IE
        else if ($.browser.safari) delta = event.wheelDelta /= 360; // Safari
        else if ($.browser.opera) delta = event.wheelDelta /= 250; // Opera
    }
    else if ( event.detail )
        delta = -event.detail / 3; // Firefox

    //if ( event.wheelDelta ) delta = event.wheelDelta/120;
    //if ( event.detail ) delta = -event.detail/3;
    //if ( $.browser.opera ) delta = -event.wheelDelta;

    event.data = event.data || {};
    event.type = "mousewheel";

    // Add delta to the front of the arguments
    args.unshift(delta);
    // Add event to the front of the arguments
    args.unshift(event);

    return $.event.handle.apply(this, args);
  }
};

$.fn.extend({
  mousewheel: function(fn) {
    return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
  },

  unmousewheel: function(fn) {
    return this.unbind("mousewheel", fn);
  }
});

})(jQuery);
