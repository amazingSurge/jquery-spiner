/*
 * spiner
 * https://github.com/amazingSurge/jquery-spiner
 *
 * Copyright (c) 2013 joeylin
 * Licensed under the MIT license.
 */

(function($) {

    var Spinner = $.spinner = function(element, options) {
        this.element = element;
        this.$element = $(element);

        this.options = $.extend({}, Spinner.defaults, options);
        this.namespace = this.options.namespace;
        this.enable = true;

        this.init();
    };

    Spinner.prototype = {
        constructor: Spinner,

        init: function() {
            var self = this;

            this.$control = $('<div class="' + this.namespace + '"><span class="' + this.namespace + '-prev"></span><span class="' + this.namespace + '-next"></span></div>');

            this.$prev = this.$control.find('.' + this.namespace + '-prev');
            this.$next = this.$control.find('.' + this.namespace + '-next');

            this.$element.wrap('<div class="' + this.options.skin + ' ' + this.namespace + '-wrap"></div>');
            this.$parent = this.$element.parent();
            this.$parent.addClass('.' + this.namespace + '-enable');

            this.$control.appendTo(this.$parent);

            // attach event
            this.$prev.on('click', function(e) {
                self.prev.call(self);
                return false;
            });

            this.$next.on('click', function(e) {
                self.next.call(self);
                return false;
            });
        },

        set: function(value) {
            if (this.enable === false) {
                return;
            }

            this.value = value;
            this.$element.val(value);
        },

        get: function() {
            return this.value;
        },

        prev: function() {
            this.value = this.value - this.step;

            if (this.isOutOfBounds() === 'min') {
                this.value = this.min;
            }

            this.set(this.value);
        },

        next: function() {
            this.value = this.value + this.step;

            if (this.isOutOfBounds() === 'max') {
                this.value = this.max;
            }

            this.set(this.value);
        },

        isOutOfBounds: function(value) {
            if (value < this.min) {
                return 'min';
            }

            if (value > this.max) {
                return 'max'
            }

            return false;
        },

        enable: function() {
            this.enable = true;
            this.$parent.addClass('.' + this.namespace + '-enable');
        },

        disable: function() {
            this.enable = false;
            this.$parent.removeClass('.' + this.namespace + '-enable');
        }

    };

    Spinner.defaults = {
        namespace: 'spinner',
        skin: 'simple',

        value: 0,
        min: 0,
        max: 10,
        step: 1,
        looping: true,
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
            var opts = options || {};
            opts.$group = this;
            return this.each(function() {
                if (!$.data(this, 'spinner')) {
                    $.data(this, 'spinner', new Spinner(this, opts));
                }
            });
        }
    };

}(jQuery));
