/**
 * Hook
 * Version: 1.1
 * Author: Jordan Singer, Brandon Jacoby, Adam Girton
 * Copyright (c) 2013 - Hook.  All rights reserved.
 * http://www.usehook.com
 */

;(function ( $, window, document, undefined ) {
    var win = $(this),
            st = win.scrollTop() || window.pageYOffset,
            called = false;

    var hasTouch = function() {
              return !!('ontouchstart' in window) || !!('onmsgesturechange' in window);
            };

      var handlers = {};

      var addHandler = function(name, fn) {
        win.on(name, fn);
        handlers[name] = fn;
      };
      var removeHandler = function(name, fn) {
        win.off(name, handlers[name]);
        delete handlers[name];
      };
      var removeHandlers = function() {
        for (var name in handlers) {
          removeHandler(name);
        }
      };

      var methods = {

        init: function(options) {

                return this.each(function() {
                    var $this = $(this),
                        settings = $this.data('hook');

                        if(typeof(settings) === 'undefined') {

                                var defaults = {
                                    reloadPage: true, // if false will reload element
                                    dynamic: true, // if false Hook elements already there
                                    textRequired: false, // will input loader text if true
                                    scrollWheelSelected: false, // will use scroll wheel events
                                    swipeDistance: 50, // swipe distance for loader to show on touch devices
                                    loaderClass: 'hook-loader',
                                    spinnerClass: 'hook-spinner',
                                    loaderTextClass: 'hook-text',
                                    loaderText: 'Reloading...',
                                    reloadEl: function() {}
                                };

                                settings = $.extend({},  defaults, options);

                                $this.data('hook', settings);
                        } else {

                                settings = $.extend({}, settings, options);
                        }

                        if(settings.dynamic === true) {
                             var loaderElem = '<div class=' + settings.loaderClass + '>';
                                     loaderElem += '<div class='+ settings.spinnerClass + '/>';
                                     loaderElem += '</div>';
                             var spinnerTextElem = '<span class='+ settings.loaderTextClass + '>' + settings.loaderText + '</span>';

                             $this
                                     .append(loaderElem);

                             if (settings.textRequired === true) {
                                  $this.addClass('hook-with-text');
                                  $this.append(spinnerTextElem);
                             }
                        }

                        if(!hasTouch()) {
                            if(settings.scrollWheelSelected === true){
                              addHandler('mousewheel', function(event, delta) {
                                  methods.onScroll($this, settings, delta);
                              })
                            } else {
                              addHandler('scroll', function() {
                                  methods.onScroll($this, settings);
                              });
                            }
                        }  else {
                            var lastY = 0,
                                 swipe = 0;
                            addHandler('touchstart', function(e){
                                lastY = e.originalEvent.touches[0].pageY;
                            });

                            addHandler('touchmove', function(e) {
                                swipe = e.originalEvent.touches[0].pageY + lastY;
                                st = $(this).scrollTop();

                                if(swipe < settings.swipeDistance) {
                                  e.preventDefault();
                                }

                                if(swipe > settings.swipeDistance && lastY <= 40) {
                                    methods.onSwipe($this, settings);
                                }
                            });

                            addHandler('touchend', function(){
                                swipe = 0;
                            });
                        }

                });
        },

        onScroll: function(el, settings, delta) {
          st = win.scrollTop();

          if(settings.scrollWheelSelected === true && (delta >= 150 && st <= 0)) {
              if(called === false) {
                  methods.reload(el, settings);
                  called = true;
              }
          }

          if(settings.scrollWheelSelected === false && st <= 0) {
            if(called === false) {
                methods.reload(el, settings);
                called = true;
            }
          }
        },

        onSwipe: function(el, settings) {
            if(st <= 0) {
                methods.reload(el, settings);
            }
        },

        reload: function(el, settings) {
                el.show();
                el.animate({
                    "marginTop": "0px"
                }, 200);
                el.delay(500).slideUp(200, function () {
                    if(settings.reloadPage) {
                        window.location.reload(true);
                    }

                    called = false;
                });

                if(!settings.reloadPage) {
                    settings.reloadEl();
                }
        },

        destroy: function() {
            removeHandlers();
            return $(this).each(function(){
                var $this = $(this);

                $this.empty();
                $this.removeData('hook');
            });
        }
    };

    $.fn.hook = function () {
        var method = arguments[0];

        if(methods[method]) {
            method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if (typeof(method) === 'object' || !method) {
            method = methods.init;
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.pluginName' );
                        return this;
        }

        return method.apply(this, arguments);
    };

})( jQuery, window, document );

;(function($){
    var $scrollLoading;

    $.fn.scrollLoading = function(settings){
        return this.each(function(){
            $scrollLoading.init($(this), settings);
        });
    };

    $scrollLoading = $.scrollLoading = {
        more: true,

        init: function(outer, settings) {
            // objects
            this.outer = $(document);
            this.appendTo = $("#msg_container");
            this.judgeBy = this.appendTo;
            this.ratio = settings.ratio || 0.7;
            // ajax settings
            this.ajaxData = settings.ajaxData || {};
            // overwrite datType
            if ('undefined' === typeof this.ajaxData.dataType || !$.inArray(this.ajaxData.dataType, ('html', 'json'))) {
                this.ajaxData.dataType = 'html';
            }

            this.tmp_success = this.ajaxData.success;
            this.ajaxData.success = function(ret) {
                sl = $scrollLoading;
                sl.resultHandler(ret);

                if ('function' === typeof sl.tmp_success) {
                    sl.tmp_success(ret);
                }

                if (sl.more) {
                    sl.checkGetMore();
                }
            };

            this.outer.scroll(function(){
                var sl = $scrollLoading;
                var scrollBottom = $(window).scrollTop() + $(window).height() - ($(document).height() - sl.judgeBy.height());
                if ((true === sl.more) && (scrollBottom / sl.judgeBy.height() >= sl.ratio)) {
                    sl.more = false;
                    sl.sendRequest();
                }
            });

            this.checkGetMore();
        },

        sendRequest: function() {
				$.ajax(this.ajaxData);
        },

        checkGetMore: function() {
            if (this.judgeBy.height() * 2 < this.outer.height()) {

                this.more = false;
                this.sendRequest();
            }
        },

        resultHandler: function(ret) {
            var content = '';
            if ('html' === this.ajaxData.dataType) {
                content = ret;
            } else if ('json' === this.ajaxData.dataType) {
                if (true === ret.error) {
                    content = '';
                } else if ('undefined' !== typeof ret.content) {
                    content = ret.content;
                }
            }

            if ('' !== content) {
                //this.appendTo.append(content);
                this.more = true;
            }
        }
    };

})(jQuery);	

(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'];
    var toBind = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
    var lowestDelta, lowestDeltaXY;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    $.event.special.mousewheel = {
        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
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


    function handler(event) {
        var orgEvent = event || window.event,
            args = [].slice.call(arguments, 1),
            delta = 0,
            deltaX = 0,
            deltaY = 0,
            absDelta = 0,
            absDeltaXY = 0,
            fn;
        event = $.event.fix(orgEvent);
        event.type = "mousewheel";

        // Old school scrollwheel delta
        if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta; }
        if ( orgEvent.detail )     { delta = orgEvent.detail * -1; }

        // New school wheel delta (wheel event)
        if ( orgEvent.deltaY ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( orgEvent.deltaX ) {
            deltaX = orgEvent.deltaX;
            delta  = deltaX * -1;
        }

        // Webkit
        if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY; }
        if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Look for lowest delta to normalize the delta values
        absDelta = Math.abs(delta);
        if ( !lowestDelta || absDelta < lowestDelta ) { lowestDelta = absDelta; }
        absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
        if ( !lowestDeltaXY || absDeltaXY < lowestDeltaXY ) { lowestDeltaXY = absDeltaXY; }

        // Get a whole value for the deltas
        fn = delta > 0 ? 'floor' : 'ceil';
        delta  = Math[fn](delta / lowestDelta);
        deltaX = Math[fn](deltaX / lowestDeltaXY);
        deltaY = Math[fn](deltaY / lowestDeltaXY);

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

}));

(function(k){for(var d,f,l=document.getElementsByTagName("head")[0].style,h=["transformProperty","WebkitTransform","OTransform","msTransform","MozTransform"],g=0;g<h.length;g++)void 0!==l[h[g]]&&(d=h[g]);d&&(f=d.replace(/[tT]ransform/,"TransformOrigin"),"T"==f[0]&&(f[0]="t"));eval('IE = "v"=="\v"');jQuery.fn.extend({rotate:function(a){if(0!==this.length&&"undefined"!=typeof a){"number"==typeof a&&(a={angle:a});for(var b=[],c=0,d=this.length;c<d;c++){var e=this.get(c);if(e.Wilq32&&e.Wilq32.PhotoEffect)e.Wilq32.PhotoEffect._handleRotation(a);
else{var f=k.extend(!0,{},a),e=(new Wilq32.PhotoEffect(e,f))._rootObj;b.push(k(e))}}return b}},getRotateAngle:function(){for(var a=[],b=0,c=this.length;b<c;b++){var d=this.get(b);d.Wilq32&&d.Wilq32.PhotoEffect&&(a[b]=d.Wilq32.PhotoEffect._angle)}return a},stopRotate:function(){for(var a=0,b=this.length;a<b;a++){var c=this.get(a);c.Wilq32&&c.Wilq32.PhotoEffect&&clearTimeout(c.Wilq32.PhotoEffect._timer)}}});Wilq32=window.Wilq32||{};Wilq32.PhotoEffect=function(){return d?function(a,b){a.Wilq32={PhotoEffect:this};
this._img=this._rootObj=this._eventObj=a;this._handleRotation(b)}:function(a,b){this._img=a;this._onLoadDelegate=[b];this._rootObj=document.createElement("span");this._rootObj.style.display="inline-block";this._rootObj.Wilq32={PhotoEffect:this};a.parentNode.insertBefore(this._rootObj,a);if(a.complete)this._Loader();else{var c=this;jQuery(this._img).bind("load",function(){c._Loader()})}}}();Wilq32.PhotoEffect.prototype={_setupParameters:function(a){this._parameters=this._parameters||{};"number"!==
typeof this._angle&&(this._angle=0);"number"===typeof a.angle&&(this._angle=a.angle);this._parameters.animateTo="number"===typeof a.animateTo?a.animateTo:this._angle;this._parameters.step=a.step||this._parameters.step||null;this._parameters.easing=a.easing||this._parameters.easing||this._defaultEasing;this._parameters.duration=a.duration||this._parameters.duration||1E3;this._parameters.callback=a.callback||this._parameters.callback||this._emptyFunction;this._parameters.center=a.center||this._parameters.center||
["50%","50%"];this._rotationCenterX="string"==typeof this._parameters.center[0]?parseInt(this._parameters.center[0],10)/100*this._imgWidth*this._aspectW:this._parameters.center[0];this._rotationCenterY="string"==typeof this._parameters.center[1]?parseInt(this._parameters.center[1],10)/100*this._imgHeight*this._aspectH:this._parameters.center[1];a.bind&&a.bind!=this._parameters.bind&&this._BindEvents(a.bind)},_emptyFunction:function(){},_defaultEasing:function(a,b,c,d,e){return-d*((b=b/e-1)*b*b*b-
1)+c},_handleRotation:function(a,b){d||this._img.complete||b?(this._setupParameters(a),this._angle==this._parameters.animateTo?this._rotate(this._angle):this._animateStart()):this._onLoadDelegate.push(a)},_BindEvents:function(a){if(a&&this._eventObj){if(this._parameters.bind){var b=this._parameters.bind,c;for(c in b)b.hasOwnProperty(c)&&jQuery(this._eventObj).unbind(c,b[c])}this._parameters.bind=a;for(c in a)a.hasOwnProperty(c)&&jQuery(this._eventObj).bind(c,a[c])}},_Loader:function(){return IE?function(){var a=
this._img.width,b=this._img.height;this._imgWidth=a;this._imgHeight=b;this._img.parentNode.removeChild(this._img);this._vimage=this.createVMLNode("image");this._vimage.src=this._img.src;this._vimage.style.height=b+"px";this._vimage.style.width=a+"px";this._vimage.style.position="absolute";this._vimage.style.top="0px";this._vimage.style.left="0px";this._aspectW=this._aspectH=1;this._container=this.createVMLNode("group");this._container.style.width=a;this._container.style.height=b;this._container.style.position=
"absolute";this._container.style.top="0px";this._container.style.left="0px";this._container.setAttribute("coordsize",a-1+","+(b-1));this._container.appendChild(this._vimage);this._rootObj.appendChild(this._container);this._rootObj.style.position="relative";this._rootObj.style.width=a+"px";this._rootObj.style.height=b+"px";this._rootObj.setAttribute("id",this._img.getAttribute("id"));this._rootObj.className=this._img.className;for(this._eventObj=this._rootObj;a=this._onLoadDelegate.shift();)this._handleRotation(a,
!0)}:function(){this._rootObj.setAttribute("id",this._img.getAttribute("id"));this._rootObj.className=this._img.className;this._imgWidth=this._img.naturalWidth;this._imgHeight=this._img.naturalHeight;var a=Math.sqrt(this._imgHeight*this._imgHeight+this._imgWidth*this._imgWidth);this._width=3*a;this._height=3*a;this._aspectW=this._img.offsetWidth/this._img.naturalWidth;this._aspectH=this._img.offsetHeight/this._img.naturalHeight;this._img.parentNode.removeChild(this._img);this._canvas=document.createElement("canvas");
this._canvas.setAttribute("width",this._width);this._canvas.style.position="relative";this._canvas.style.left=-this._img.height*this._aspectW+"px";this._canvas.style.top=-this._img.width*this._aspectH+"px";this._canvas.Wilq32=this._rootObj.Wilq32;this._rootObj.appendChild(this._canvas);this._rootObj.style.width=this._img.width*this._aspectW+"px";this._rootObj.style.height=this._img.height*this._aspectH+"px";this._eventObj=this._canvas;for(this._cnv=this._canvas.getContext("2d");a=this._onLoadDelegate.shift();)this._handleRotation(a,
!0)}}(),_animateStart:function(){this._timer&&clearTimeout(this._timer);this._animateStartTime=+new Date;this._animateStartAngle=this._angle;this._animate()},_animate:function(){var a=+new Date,b=a-this._animateStartTime>this._parameters.duration;if(b&&!this._parameters.animatedGif)clearTimeout(this._timer);else{if(this._canvas||this._vimage||this._img)a=this._parameters.easing(0,a-this._animateStartTime,this._animateStartAngle,this._parameters.animateTo-this._animateStartAngle,this._parameters.duration),
this._rotate(~~(10*a)/10);this._parameters.step&&this._parameters.step(this._angle);var c=this;this._timer=setTimeout(function(){c._animate.call(c)},10)}this._parameters.callback&&b&&(this._angle=this._parameters.animateTo,this._rotate(this._angle),this._parameters.callback.call(this._rootObj))},_rotate:function(){var a=Math.PI/180;return IE?function(a){this._angle=a;this._container.style.rotation=a%360+"deg";this._vimage.style.top=-(this._rotationCenterY-this._imgHeight/2)+"px";this._vimage.style.left=
-(this._rotationCenterX-this._imgWidth/2)+"px";this._container.style.top=this._rotationCenterY-this._imgHeight/2+"px";this._container.style.left=this._rotationCenterX-this._imgWidth/2+"px"}:d?function(a){this._angle=a;this._img.style[d]="rotate("+a%360+"deg)";this._img.style[f]=this._parameters.center.join(" ")}:function(b){this._angle=b;b=b%360*a;this._canvas.width=this._width;this._canvas.height=this._height;this._cnv.translate(this._imgWidth*this._aspectW,this._imgHeight*this._aspectH);this._cnv.translate(this._rotationCenterX,
this._rotationCenterY);this._cnv.rotate(b);this._cnv.translate(-this._rotationCenterX,-this._rotationCenterY);this._cnv.scale(this._aspectW,this._aspectH);this._cnv.drawImage(this._img,0,0)}}()};IE&&(Wilq32.PhotoEffect.prototype.createVMLNode=function(){document.createStyleSheet().addRule(".rvml","behavior:url(#default#VML)");try{return!document.namespaces.rvml&&document.namespaces.add("rvml","urn:schemas-microsoft-com:vml"),function(a){return document.createElement("<rvml:"+a+' class="rvml">')}}catch(a){return function(a){return document.createElement("<"+
a+' xmlns="urn:schemas-microsoft.com:vml" class="rvml">')}}}())})(jQuery);

(function($) {
  $.flexselect = function(select, options) { this.init(select, options); };

  $.extend($.flexselect.prototype, {
    settings: {
      allowMismatch: false,
      allowMismatchBlank: true, // If "true" a user can backspace such that the value is nothing (even if no blank value was provided in the original criteria)
      sortBy: 'score', // 'score' || 'name'
      preSelection: true,
      hideDropdownOnEmptyInput: false,
      selectedClass: "flexselect_selected",
      dropdownClass: "flexselect_dropdown",
      inputIdTransform:    function(id)   { return id + "_flexselect"; },
      inputNameTransform:  function(name) { return; },
      dropdownIdTransform: function(id)   { return id + "_flexselect_dropdown"; }
    },
    select: null,
    input: null,
    dropdown: null,
    dropdownList: null,
    cache: [],
    results: [],
    lastAbbreviation: null,
    abbreviationBeforeFocus: null,
    selectedIndex: 0,
    picked: false,
    allowMouseMove: true,
    dropdownMouseover: false, // Workaround for poor IE behaviors

    init: function(select, options) {
      this.settings = $.extend({}, this.settings, options);
      this.select = $(select);
      this.preloadCache();
      this.renderControls();
      this.wire();
    },

    preloadCache: function() {
      this.cache = this.select.find("option").map(function() {
        return { name: $.trim($(this).text()), value: $(this).val(), score: 0.0 };
      });
    },

    renderControls: function() {
      var selected = this.settings.preSelection ? this.select.find("option:selected") : null;

      this.input = $("<input type='text' autocomplete='off' />").attr({
        id: this.settings.inputIdTransform(this.select.attr("id")),
        name: this.settings.inputNameTransform(this.select.attr("name")),
        accesskey: this.select.attr("accesskey"),
        tabindex: this.select.attr("tabindex"),
        style: this.select.attr("style"),
        placeholder: this.select.attr("data-placeholder")
      }).addClass(this.select.attr("class")).val($.trim(selected ? selected.text():  '')).css({
        visibility: 'visible'
      });

      this.dropdown = $("<div></div>").attr({
        id: this.settings.dropdownIdTransform(this.select.attr("id"))
      }).addClass(this.settings.dropdownClass);
      this.dropdownList = $("<ul></ul>");
      this.dropdown.append(this.dropdownList);

      this.select.after(this.input).hide();
      $("body").append(this.dropdown);
    },

    wire: function() {
      var self = this;

      this.input.click(function() {
        self.lastAbbreviation = null;
        self.focus();
      });

      this.input.mouseup(function(event) {
        // This is so Safari selection actually occurs.
        event.preventDefault();
      });

      this.input.focus(function() {
        self.abbreviationBeforeFocus = self.input.val();
        self.input.select();
        if (!self.picked) self.filterResults();
      });

      this.input.blur(function() {
        if (!self.dropdownMouseover) {
          self.hide();
          if (self.settings.allowMismatchBlank && $.trim($(this).val()) == '')
            self.setValue('');
          if (!self.settings.allowMismatch && !self.picked)
            self.reset();
        }
        if (self.settings.hideDropdownOnEmptyInput)
          self.dropdownList.show();
      });

      this.dropdownList.mouseover(function(event) {
        if (!self.allowMouseMove) {
          self.allowMouseMove = true;
          return;
        }

        if (event.target.tagName == "LI") {
          var rows = self.dropdown.find("li");
          self.markSelected(rows.index($(event.target)));
        }
      });
      this.dropdownList.mouseleave(function() {
        self.markSelected(-1);
      });
      this.dropdownList.mouseup(function(event) {
        self.pickSelected();
        self.focusAndHide();
      });
      this.dropdown.mouseover(function(event) {
        self.dropdownMouseover = true;
      });
      this.dropdown.mouseleave(function(event) {
        self.dropdownMouseover = false;
      });
      this.dropdown.mousedown(function(event) {
        event.preventDefault();
      });

      this.input.keyup(function(event) {
        switch (event.keyCode) {
          case 13: // return
            event.preventDefault();
            self.pickSelected();
            self.focusAndHide();
            break;
          case 27: // esc
            event.preventDefault();
            self.reset();
            self.focusAndHide();
            break;
          default:
            self.filterResults();
            break;
        }
        if (self.settings.hideDropdownOnEmptyInput){
          if(self.input.val() == "")
            self.dropdownList.hide();
          else
            self.dropdownList.show();
        }
      });

      this.input.keydown(function(event) {
        switch (event.keyCode) {
          case 9:  // tab
            self.pickSelected();
            self.hide();
            break;
          case 33: // pgup
            event.preventDefault();
            self.markFirst();
            break;
          case 34: // pgedown
            event.preventDefault();
            self.markLast();
            break;
          case 38: // up
            event.preventDefault();
            self.moveSelected(-1);
            break;
          case 40: // down
            event.preventDefault();
            self.moveSelected(1);
            break;
          case 13: // return
          case 27: // esc
            event.preventDefault();
            event.stopPropagation();
            break;
        }
      });

      var input = this.input;
      this.select.change(function () {
        input.val($.trim($(this).find('option:selected').text()));
      });
    },

    filterResults: function() {
      var abbreviation = this.input.val();
      if (abbreviation == this.lastAbbreviation) return;

      var results = [];
      $.each(this.cache, function() {
        this.score = LiquidMetal.score(this.name, abbreviation);
        if (this.score > 0.0) results.push(this);
      });
      this.results = results;

      if (this.settings.sortBy == 'score')
        this.sortResultsByScore();
      else if (this.settings.sortBy == 'name')
        this.sortResultsByName();

      this.renderDropdown();
      this.markFirst();
      this.lastAbbreviation = abbreviation;
      this.picked = false;
      this.allowMouseMove = false;
    },

    sortResultsByScore: function() {
      this.results.sort(function(a, b) { return b.score - a.score; });
    },

    sortResultsByName: function() {
      this.results.sort(function(a, b) { return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0); });
    },

    renderDropdown: function() {
      var dropdownBorderWidth = this.dropdown.outerWidth() - this.dropdown.innerWidth();
      var inputOffset = this.input.offset();
      this.dropdown.css({
        width: (this.input.outerWidth() - dropdownBorderWidth) + "px",
        top: (inputOffset.top + this.input.outerHeight()) + "px",
        left: inputOffset.left + "px",
        maxHeight: ''
      });

      var html = '';
      $.each(this.results, function() {
        //html += '<li>' + this.name + ' <small>[' + Math.round(this.score*100)/100 + ']</small></li>';
        html += '<li>' + this.name + '</li>';
      });
      this.dropdownList.html(html);
      this.adjustMaxHeight();
      this.dropdown.show();
    },

    adjustMaxHeight: function() {
      var maxTop = $(window).height() + $(window).scrollTop() - this.dropdown.outerHeight();
      var top = parseInt(this.dropdown.css('top'), 10);
      this.dropdown.css('max-height', top > maxTop ? (Math.max(0, maxTop - top + this.dropdown.innerHeight()) + 'px') : '');
    },

    markSelected: function(n) {
      if (n < 0 || n >= this.results.length) return;

      var rows = this.dropdown.find("li");
      rows.removeClass(this.settings.selectedClass);
      this.selectedIndex = n;

      var row = $(rows[n]).addClass(this.settings.selectedClass);
      var top = row.position().top;
      var delta = top + row.outerHeight() - this.dropdown.height();
      if (delta > 0) {
        this.allowMouseMove = false;
        this.dropdown.scrollTop(this.dropdown.scrollTop() + delta);
      } else if (top < 0) {
        this.allowMouseMove = false;
        this.dropdown.scrollTop(Math.max(0, this.dropdown.scrollTop() + top));
      }
    },

    pickSelected: function() {
      var selected = this.results[this.selectedIndex];
      if (selected) {
        this.input.val(selected.name);
        this.setValue(selected.value);
        this.picked = true;
      } else if (this.settings.allowMismatch) {
        this.setValue.val("");
      } else {
        this.reset();
      }
    },

    setValue: function(val) {
      if (this.select.val() === val) return;
      this.select.val(val).change();
    },

    hide: function() {
      this.dropdown.hide();
      this.lastAbbreviation = null;
    },

    moveSelected: function(n) { this.markSelected(this.selectedIndex+n); },
    markFirst:    function()  { this.markSelected(0); },
    markLast:     function()  { this.markSelected(this.results.length - 1); },
    reset:        function()  { this.input.val(this.abbreviationBeforeFocus); },
    focus:        function()  { this.input.focus(); },
    focusAndHide: function()  { this.focus(); this.hide(); }
  });

  $.fn.flexselect = function(options) {
    this.each(function() {
      if (this.tagName == "SELECT") new $.flexselect(this, options);
    });
    return this;
  };
})(jQuery);

/**
 * LiquidMetal, version: 1.2.1 (2012-04-21)
 *
 * A mimetic poly-alloy of Quicksilver's scoring algorithm, essentially
 * LiquidMetal.
 *
 * For usage and examples, visit:
 * http://github.com/rmm5t/liquidmetal
 *
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2009-2012, Ryan McGeary (ryan -[at]- mcgeary [*dot*] org)
 */
var LiquidMetal = (function() {
  var SCORE_NO_MATCH = 0.0;
  var SCORE_MATCH = 1.0;
  var SCORE_TRAILING = 0.8;
  var SCORE_TRAILING_BUT_STARTED = 0.9;
  var SCORE_BUFFER = 0.85;
  var WORD_SEPARATORS = " \t_-";

  return {
    lastScore: null,
    lastScoreArray: null,

    score: function(string, abbrev) {
      // short circuits
      if (abbrev.length === 0) return SCORE_TRAILING;
      if (abbrev.length > string.length) return SCORE_NO_MATCH;

      // match & score all
      var allScores = [];
      var search = string.toLowerCase();
      abbrev = abbrev.toLowerCase();
      this._scoreAll(string, search, abbrev, -1, 0, [], allScores);

      // complete miss
      if (allScores.length == 0) return 0;

      // sum per-character scores into overall scores,
      // selecting the maximum score
      var maxScore = 0.0, maxArray = [];
      for (var i = 0; i < allScores.length; i++) {
        var scores = allScores[i];
        var scoreSum = 0.0;
        for (var j = 0; j < string.length; j++) { scoreSum += scores[j]; }
        if (scoreSum > maxScore) {
          maxScore = scoreSum;
          maxArray = scores;
        }
      }

      // normalize max score by string length
      // s. t. the perfect match score = 1
      maxScore /= string.length;

      // record maximum score & score array, return
      this.lastScore = maxScore;
      this.lastScoreArray = maxArray;
      return maxScore;
    },

    _scoreAll: function(string, search, abbrev, searchIndex, abbrIndex, scores, allScores) {
      // save completed match scores at end of search
      if (abbrIndex == abbrev.length) {
        // add trailing score for the remainder of the match
        var started = (search.charAt(0) == abbrev.charAt(0));
        var trailScore = started ? SCORE_TRAILING_BUT_STARTED : SCORE_TRAILING;
        fillArray(scores, trailScore, scores.length, string.length);
        // save score clone (since reference is persisted in scores)
        allScores.push(scores.slice(0));
        return;
      }

      // consume current char to match
      var c = abbrev.charAt(abbrIndex);
      abbrIndex++;

      // cancel match if a character is missing
      var index = search.indexOf(c, searchIndex);
      if (index == -1) return;

      // match all instances of the abbreviaton char
      var scoreIndex = searchIndex; // score section to update
      while ((index = search.indexOf(c, searchIndex+1)) != -1) {
        // score this match according to context
        if (isNewWord(string, index)) {
          scores[index-1] = 1;
          fillArray(scores, SCORE_BUFFER, scoreIndex+1, index-1);
        }
        else if (isUpperCase(string, index)) {
          fillArray(scores, SCORE_BUFFER, scoreIndex+1, index);
        }
        else {
          fillArray(scores, SCORE_NO_MATCH, scoreIndex+1, index);
        }
        scores[index] = SCORE_MATCH;

        // consume matched string and continue search
        searchIndex = index;
        this._scoreAll(string, search, abbrev, searchIndex, abbrIndex, scores, allScores);
      }
    }
  };

  function isUpperCase(string, index) {
    var c = string.charAt(index);
    return ("A" <= c && c <= "Z");
  }

   function isNewWord(string, index) {
    var c = string.charAt(index-1);
    return (WORD_SEPARATORS.indexOf(c) != -1);
  }

  function fillArray(array, value, from, to) {
    for (var i = from; i < to; i++) { array[i] = value; }
    return array;
  }
})();


