/*
 * spinner
 * https://github.com/amazingSurge/jquery-spinner
 *
 * Copyright (c) 2013 joeylin
 * Licensed under the MIT license.
 */

(function($) {

    var Spinner = $.spinner = function(element, options) {
        this.element = element;
        this.$element = $(element);

        // options
        var meta_data = [];
        $.each(this.$element.data(), function(k, v) {
            var re = new RegExp("^spinner", "i");
            if (re.test(k)) {
                meta_data[k.toLowerCase().replace(re, '')] = v;
            }
        });

        this.options = $.extend({}, Spinner.defaults, options, meta_data);
        this.namespace = this.options.namespace;

        if (this.options.rule) {
            var self = this;
            var array = ['min','max','step','precision'];
            $.each(array, function(key,value) {
                self[value] = Spinner.rules[self.options.rule][value];
            });
        } else {
            this.min = this.options.min;
            this.max = this.options.max;
            this.step = this.options.step;
            this.precision = this.options.precision;
        }

        this.disabled = false;
        this.value = this.options.value;
        this.eventBinded = false;
        this.mousewheel = this.options.mousewheel;
        this.spinTimeout = null;
        this.isFocused = false;

        this.classes = {
            disabled: this.namespace + '_disabled',
            skin: this.namespace + '_' + this.options.skin,
            focus: this.namespace + '_focus',

            control: this.namespace + '-control',
            prev: this.namespace + '-prev',
            next: this.namespace + '-next',
            wrap: this.namespace + '-wrap'
        };
        
        this.init();
    };

    Spinner.prototype = {
        constructor: Spinner,

        init: function() {
            this.$control = $('<div class="' + this.namespace + '-control"><span class="' + this.classes.prev + '"></span><span class="' + this.classes.next + '"></span></div>');
            this.$wrap = this.$element.wrap('<div tabindex="0" class="' + this.classes.wrap + '"></div>').parent();
            this.$prev = this.$control.find('.' + this.classes.prev);
            this.$next = this.$control.find('.' + this.classes.next); 
            
            this.$element.addClass(this.namespace);

            if (this.options.skin) {
                this.$wrap.addClass(this.classes.skin);
            }

            this.$control.appendTo(this.$wrap);
            
            if (this.disabled === false) {
                // attach event
                this.bindEvent();
            } else {
                this.$wrap.addClass(this.classes.disabled);
            }

            // inital
            this.set(this.value);
            this.$element.trigger('spinner::ready', this);
        },
        // 500ms to detect if it is a click event
        // 100ms interval execute if it if long pressdown
        spin: function(fn,timeout) {
            var self = this;
            var next = function(timeout) {
                clearTimeout(self.spinTimeout);    
                self.spinTimeout = setTimeout(function(){
                    fn.call(self);
                    next(100);
                },timeout);
            };
            next(timeout || 500);
        },
        _focus: function() {
            if (!this.isFocused) {
                this.$element.focus();
            }
        },
        bindEvent: function() {
            var self = this;
            this.eventBinded = true;
            this.$prev.on('mousedown.spinner', function() {
                self._focus();
                self.spin(self.prev);
                return false;
            }).on('mouseup',function() {
                clearTimeout(self.spinTimeout);
                self.prev.call(self);
                return false;
            });

            this.$next.on('mousedown.spinner', function() {
                self._focus();
                self.spin(self.next);
                return false;
            }).on('mouseup',function() {
                clearTimeout(self.spinTimeout);
                return false;
            }).on('click.spinner', function() {
                self.next.call(self);
                return false;
            });

            this.$element.on('focus.spinner', function() {
                self._set(self.value);
                return false;
            }).on('blur.spinner', function() {
                var value = $.trim(self.$element.val());
                // here how to parse value for input value attr
                if (typeof this.options.parse === 'function') {
                    value = this.options.parse(value);
                } else {
                    // TODO: default parse method
                    var re;
                }
                self.set(value);
                return false;
            });

            this.$wrap.on('blur.spinner', function() {
                self.set(self.value);
                self.$wrap.removeClass(self.classes.focus);
                return false;
            }).on('click.spinner', function() {
                self.$wrap.addClass(self.classes.focus);
                return false;
            });

            this.$element.on('focus.spinner', function() {
                self.isFocused = true;
                $(this).on('keydown.spinner', function(e) {
                    var key = e.keyCode || e.which;
                    if (key === 38) {
                        self.next.call(self);
                        return false;
                    }
                    if (key === 40) {
                        self.prev.call(self);
                        return false;
                    }
                });
                if (self.mousewheel === true) {
                    $(this).mousewheel(function(event, delta) {
                        if (delta > 0) {
                            self.next();
                        } else {
                            self.prev();
                        }
                        event.preventDefault();
                    });
                }
            }).on('blur.spinner', function() {
                self.isFocused = false;
                $(this).off('keydown.spinner');
                self.$wrap.removeClass(self.classes.focus);
                if (self.mousewheel === true) {
                    self.$element.unmousewheel();
                }
            });
        },
        unbindEvent: function() {
            this.eventBinded = false;
            this.$element.off('focus').off('blur').off('keydown');
            this.$prev.off('click').off('mousedown').off('mouseup');
            this.$next.off('click').off('mousedown').off('mouseup');
            this.$wrap.off('blur').off('click');
        },
        isNumber: function(value) {
            // get rid of NaN
            if (typeof value === 'number' && $.isNumeric(value)) {
                return true;
            } else {
                return false;
            }
        },
        isOutOfBounds: function(value) {
            if (value < this.min) {
                return -1;
            }
            if (value > this.max) {
                return 1;
            }
            return 0;
        },
        _set: function(value, callback) {
            var valid = this.isOutOfBounds(value);
            if (valid !== 0) {
                if (this.options.looping === true) {
                    value = (valid === 1) ? this.min : this.max;
                } else {
                    value = (valid === -1) ? this.min : this.max;
                }
            }
            this.value = value = value.toFixed(this.precision);
            if (typeof callback === 'function') {
                value = callback(value);
            }
            this.$element.val(value);
        },
        set: function(value) {
            this._set(value, this.options.format);
            this.$element.trigger('spinner::change', this);
        },
        get: function() {
            return this.value;
        },

        /*
            Public Method
         */
        
        val: function(value) {
            if (value) {
                this.set(value);
            } else {
                return this.get();
            }
        },
        prev: function() {
            if (!$.isNumeric(this.value)) {
                this.value = 0;
            }
            this.value = parseFloat(this.value) - parseFloat(this.step);   
            this._set(this.value);
            return this;
        },
        next: function() {
            if (!$.isNumeric(this.value)) {
                this.value = 0;
            }
            this.value = parseFloat(this.value) + parseFloat(this.step);
            this._set(this.value);
            return this;
        },
        enable: function() {
            this.disabled = false;
            this.$wrap.addClass(this.classes.disabled);
            if (this.eventBinded === false) {
                this.bindEvent();
            } 
            return this;
        },
        disable: function() {
            this.disabled = true;
            this.$wrap.removeClass(this.classes.disabled);
            this.unbindEvent();
            return this;
        },
        destroy: function() {
            this.unbindEvent();
        }
    };

    Spinner.rules = {
        defaults: {min: null, max: null, step: 1, precision:0},
        currency: {min: 0.00, max: null, step: 0.01, precision: 2},
        quantity: {min: 1, max: 999, step: 1, precision:0},
        percent:  {min: 1, max: 100, step: 1, precision:0},
        month:    {min: 1, max: 12, step: 1, precision:0},
        day:      {min: 1, max: 31, step: 1, precision:0},
        hour:     {min: 0, max: 23, step: 1, precision:0},
        minute:   {min: 1, max: 59, step: 1, precision:0},
        second:   {min: 1, max: 59, step: 1, precision:0}
    };

    Spinner.defaults = {
        namespace: 'spinner',
        skin: null,

        value: 0,
        min: -10,
        max: 10,
        step: 1,
        precision: 0,
        rule: null,   //string, shortcut define max min step precision 

        looping: false, // if cycling the value when it is outofbound
        mousewheel: false, // support mouse wheel

        format: null, // function, define custom format
        parse: null   // function, parse custom format value
    };

    $.fn.spinner = function(options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;

            return this.each(function() {
                var api = $.data(this, 'spinner');
                if (typeof api[method] === 'function') {
                    api[method].apply(api, method_arguments);
                }
            });
        } else {
            return this.each(function() {
                if (!$.data(this, 'spinner')) {
                    $.data(this, 'spinner', new Spinner(this, options));
                }
            });
        }
    };
    
}(jQuery));