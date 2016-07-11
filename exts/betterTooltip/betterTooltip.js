/*!
 * Copyright 2002 - 2016 Webdetails, a Pentaho company.  All rights reserved.
 *
 * This software was developed by Webdetails and is provided under the terms
 * of the Mozilla Public License, Version 2.0, or any later version. You may not use
 * this file except in compliance with the license. If you need a copy of the license,
 * please go to  http://mozilla.org/MPL/2.0/. The Initial Developer is Webdetails.
 *
 * Software distributed under the Mozilla Public License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or  implied. Please refer to
 * the license for the specific language governing your rights and limitations.
 */

(function() {
    "use strict";

    /*global define:true, pvc:true, def:true */

    function moduleDef(def, pvc) {

        /**
         * @class
         * @name pvc.ext.BetterTooltip
         *
         * @classdesc A rich HTML tooltip.
         *
         * To create an instance, use the factory function
         * {@link pvc.ext.betterTooltip}.
         *
         * ## Basic Usage
         * Include the extension's files:
         *
         * 1. `betterTooltip.js`
         * 2. `betterTooltip.css`
         *
         * (If using AMD/Require-JS, the "css" AMD plugin must be registered and
         * will automatically load the accompanying stylesheet).
         *
         * In CDE, add the file or files as dashboard resources.
         *
         * Then, within a CDF chart component's `preExecution` handler, write:
         * ```javascript
         * pvc.ext.betterTooltip()
         *      .install(this.chartDefinition);
         * ```
         *
         * ## Usage
         *
         * #### Displaying values in percentage, fallback to value if not available
         *
         * ```javascript
         * pvc.ext.betterTooltip()
         *      .measuresValueFormatString("{value.percent.label|value.label}")
         *      .install(this.chartDefinition);
         * ```
         * ## Live examples
         *
         * [Examples page](examples/exts/betterTooltip/examples.html).
         */

        /**
         * Creates a rich HTML tooltip formatter.
         * @alias betterTooltip
         * @memberOf pvc.ext
         * @function
         * @return {pvc.ext.BetterTooltip} A new tooltip formatter.
         */
        function betterTooltip() {
            var _categoryLabelFormatString = "{label}:&nbsp;{value.label}";
            var _categoryLabelFormatFunction = defaultFormatFunction;

            var _seriesLabelFormatString = "{value.label}";
            var _seriesLabelFormatFunction = defaultFormatFunction;

            var _measuresLabelFormatString = "{label}";
            var _measuresLabelFormatFunction = defaultFormatFunction;

            var _measuresValueFormatString = "{value.label}";
            var _measuresValueFormatFunction = defaultFormatFunction;

            function formatter(cd, defaults) {
                // Optional
                var copy = (defaults ? def.setUDefaults : def.copyOwn);
                copy(cd, {
                    tooltipEnabled:     true,
                    tooltipOpacity:     1,
                    tooltipGravity:     "s",
                    tooltipClassName:   "ccc-ext-better-tooltip",
                    tooltipFollowMouse: true
                });

                // Required
                cd.tooltipFormat = formatter.format;
                return cd;
            }

            /**
             * Installs this extension in a given chart definition.
             *
             * The formatter instance itself can be called as a function,
             * being equivalent to calling this method.
             *
             * This function defaults the properties:
             * * `tooltipEnabled` — `true`
             * * `tooltipOpacity` — `1`
             * * `tooltipGravity` — `"s"`
             * * `tooltipClassName` — `"ccc-ext-better-tooltip"`
             * * `tooltipFollowMouse` — `true`
             *
             * This function sets the required property: `tooltipFormat`.
             *
             * @name pvc.ext.BetterTooltip#install
             * @function
             * @param {Object} cd The chart definition to extend.
             * @param {boolean} [defaults=false] Indicates that
             * only required or optional properties not present in the chart definition are set.
             * @return {pvc.ext.BetterTooltip} This instance.
             */
            formatter.install = formatter;

            /**
             * Formats an HTML tooltip for a given scene.
             *
             * This function can be called on any `this` context,
             * and will always exhibit the same behavior.
             *
             * Normally you would not use this function directly,
             * as {@link pvc.ext.BetterTooltip#install}
             * sets this as the chart"s `tooltipFormat` for you.
             *
             * @alias format
             * @memberOf pvc.ext.BetterTooltip#
             * @function
             * @param {pvc.visual.Scene} scene The categorical scene for which to render the tooltip.
             * @return {string} The tooltip HTML string.
             */
            formatter.format = function(scene) {
                var model = buildModel.call(formatter, scene);

                return betterTooltipRenderer.call(formatter, model);
            };

            /**
             * Gets or sets the format string for the label of the category. Used by the default label formater.
             *
             * Defaults to "{label}:&nbsp;{value.label}".
             *
             * @alias categoryLabelFormatString
             * @memberOf pvc.ext.BetterTooltip#
             * @function
             * @param {string} [_] The new value.
             * @return {pvc.ext.BetterTooltip|string} The property value, when getting, `this` instance, when setting.
             */
            formatter.categoryLabelFormatString = function(_) {
                if(arguments.length) {
                    _categoryLabelFormatString = _;
                    return formatter;
                }

                return _categoryLabelFormatString;
            };

            /**
             * Gets or sets the format function for the label of the category.
             *
             * The default format function uses the categoryLabelFormatString property for creating the label.
             *
             * Custom formaters receive the full tooltip model object, the category being formated and the
             * current value of the categoryLabelFormatString property. Must return the formatted label.
             *
             * @alias categoryLabelFormatFunction
             * @memberOf pvc.ext.BetterTooltip#
             * @function
             * @param {function} [_] The new value.
             * @return {pvc.ext.BetterTooltip|function} The property value, when getting, `this` instance, when setting.
             */
            formatter.categoryLabelFormatFunction = function(_) {
                if(arguments.length) {
                    _categoryLabelFormatFunction = _;
                    return formatter;
                }

                return _categoryLabelFormatFunction;
            };

            /**
             * Gets or sets the format string for the label of the series. Used by the default label formater.
             *
             * Defaults to "{value.label}".
             *
             * @alias seriesLabelFormatString
             * @memberOf pvc.ext.BetterTooltip#
             * @function
             * @param {string} [_] The new value.
             * @return {pvc.ext.BetterTooltip|string} The property value, when getting, `this` instance, when setting.
             */
            formatter.seriesLabelFormatString = function(_) {
                if(arguments.length) {
                    _seriesLabelFormatString = _;
                    return formatter;
                }

                return _seriesLabelFormatString;
            };

            /**
             * Gets or sets the format function for the label of the series.
             *
             * The default format function uses the seriesLabelFormatString property for creating the label.
             *
             * Custom formaters receive the full tooltip model object, the series being formated and the
             * current value of the seriesLabelFormatString property. Must return the formatted label.
             *
             * @alias seriesLabelFormatFunction
             * @memberOf pvc.ext.BetterTooltip#
             * @function
             * @param {function} [_] The new value.
             * @return {pvc.ext.BetterTooltip|function} The property value, when getting, `this` instance, when setting.
             */
            formatter.seriesLabelFormatFunction = function(_) {
                if(arguments.length) {
                    _seriesLabelFormatFunction = _;
                    return formatter;
                }

                return _seriesLabelFormatFunction;
            };

            /**
             * Gets or sets the format string for the label of the measures. Used by the default label formater.
             *
             * Defaults to "{label}".
             *
             * @alias measuresLabelFormatString
             * @memberOf pvc.ext.BetterTooltip#
             * @function
             * @param {string} [_] The new value.
             * @return {pvc.ext.BetterTooltip|string} The property value, when getting, `this` instance, when setting.
             */
            formatter.measuresLabelFormatString = function(_) {
                if(arguments.length) {
                    _measuresLabelFormatString = _;
                    return formatter;
                }

                return _measuresLabelFormatString;
            };

            /**
             * Gets or sets the format function for the label of the measures.
             *
             * The default format function uses the measuresLabelFormatString property for creating the label.
             *
             * Custom formaters receive the full tooltip model object, the measure being formated and the
             * current value of the measuresLabelFormatString property. Must return the formatted label.
             *
             * @alias measuresLabelFormatFunction
             * @memberOf pvc.ext.BetterTooltip#
             * @function
             * @param {function} [_] The new value.
             * @return {pvc.ext.BetterTooltip|function} The property value, when getting, `this` instance, when setting.
             */
            formatter.measuresLabelFormatFunction = function(_) {
                if(arguments.length) {
                    _measuresLabelFormatFunction = _;
                    return formatter;
                }

                return _measuresLabelFormatFunction;
            };

            /**
             * Gets or sets the format string for the value of the measures. Used by the default label formater.
             *
             * Defaults to "{value}".
             *
             * @alias measuresValueFormatString
             * @memberOf pvc.ext.BetterTooltip#
             * @function
             * @param {string} [_] The new value.
             * @return {pvc.ext.BetterTooltip|string} The property value, when getting, `this` instance, when setting.
             */
            formatter.measuresValueFormatString = function(_) {
                if(arguments.length) {
                    _measuresValueFormatString = _;
                    return formatter;
                }

                return _measuresValueFormatString;
            };

            /**
             * Gets or sets the format function for the value of the measures.
             *
             * The default format function uses the measuresValueFormatString property for creating the value.
             *
             * Custom formaters receive the full tooltip model object, the measure being formated and the
             * current value of the measuresValueFormatString property. Must return the formatted value.
             *
             * @alias measuresValueFormatFunction
             * @memberOf pvc.ext.BetterTooltip#
             * @function
             * @param {function} [_] The new value.
             * @return {pvc.ext.BetterTooltip|function} The property value, when getting, `this` instance, when setting.
             */
            formatter.measuresValueFormatFunction = function(_) {
                if(arguments.length) {
                    _measuresValueFormatFunction = _;
                    return formatter;
                }

                return _measuresValueFormatFunction;
            };

            return formatter;
        }

        /**
         * Builds the tooltip model from the CCC scene information.
         *
         * @param {Object} scene The CCC scene.
         *
         * @return {Object} The tooltip model.
         */
        function buildModel(scene) {
            var tooltipModels = {
                category: null,
                series:   null,
                measures: [] 
            };

            var dimensions = scene.root.chart().data.type.dimensions();

            for(var key in dimensions) {
                var dimValue = getDimensionValue(key);

                if(isContinue(dimValue, key)) continue;

                var dimInfo = {value: dimValue, label: dimensions[key].label || ""};

                if(key === "category") {
                    var isNumeric = !isNaN(dimValue.value);

                    if(isNumeric) tooltipModels.measures.push(dimInfo);
                    else tooltipModels.category = dimInfo;

                } else {
                    dimInfo.value = scene.vars[key];
                    tooltipModels.measures.push(dimInfo);
                    
                }
            }

            tooltipModels.series = getSeriesInfo();

            return tooltipModels;

            // ------ Private functions

            function isContinue(value, key) {
                if(!value) return true;

                var reg = /^(series|\D+\d)$/;
                return reg.exec(key) != null;
            }

            function getDimensionValue(key) {
                var dimVar  = scene.vars[key]  || {},
                    dimAtom = scene.atoms[key] || {};

                var value = dimVar.value || dimAtom.value;
                if(!value) return null;

                var label = dimVar.label || dimAtom.label;
                return {value: value, label: label};
            }

            function getSeriesInfo() {
                var series      = dimensions.series; 
                var seriesValue = scene.getSeries();

                var rootColor   = scene.root.panel().axes.color;
                var colorVar    = scene.vars.color;
                var color       = rootColor.isDiscrete() && colorVar ? rootColor.scale(colorVar).color : null;

                var value;
                if(seriesValue != null) {
                    value = {
                        value: seriesValue,
                        label: scene.getSeriesLabel()
                    };
                } else {
                    var firstMeasure = tooltipModels.measures[0]
                    value = {value: firstMeasure.value, label: ""};

                    if(tooltipModels.category && (!series || tooltipModels.measures.length > 1)) {
                        value.label = tooltipModels.category.value.label;
                        tooltipModels.category = null;
                    } else value.label = firstMeasure.label;
                }

                return {color: color, value: value, label: (series && series.label) || ""};
            }
        }

        /**
         * The default format function replaces tokens in the received format string
         * with values from the current tooltipModel subject (category, series, measure).
         *
         * @param {Object} tooltipModel The tooltip model object (not used by the default formater).
         * @param {Object} subject The current tooltip subject being formated.
         * @param {string} formatString The format string.
         *
         * @return {string} The formated text.
         */
        function defaultFormatFunction(tooltipModel, subject, formatString) {
            var matcher = /\{(.*?)\}/g;

            var result = formatString;

            var match;
            while(match = matcher.exec(formatString)) {
                var alternatives = match[1].split("|");

                while(alternatives.length) {
                    var path = alternatives.shift().split(".");

                    var value = subject;
                    while(value && path.length) {
                        value = value[path.shift()];
                    }

                    if(value) {
                        result = result.replace(match[0], def.html.escape(value.toString()));
                        // skip remaining alternatives
                        break;
                    }
                }
            }

            return result;
        }

        /**
         * The renderer method is called with a pre-built tooltip model object,
         * and having the formater instance as `this` context.
         *
         * @param {Object} tooltipModel The tooltip model object.
         *
         * @return {string} The HTML of the rendered tooltip.
         */
        function betterTooltipRenderer(tooltipModel) {
            var baseElement = document.createElement("div");

            if(tooltipModel.category) {
                var titleElement = document.createElement("h1");
                titleElement.innerHTML = defaultFormatFunction(tooltipModel, tooltipModel.category, this.categoryLabelFormatString());

                baseElement.appendChild(titleElement);
            }

            var seriesElement = document.createElement("div");
            seriesElement.className = "series";

            var labelElement = document.createElement("h2");

            if(tooltipModel.series != null) {
                if(tooltipModel.series.color != null) {
                    var colorElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    colorElement.style.fill = tooltipModel.series.color;
                    colorElement.setAttribute("viewBox", "0 0 4 4");
                    colorElement.setAttribute("class", "color");

                    var circleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circleElement.setAttribute("cx", "2");
                    circleElement.setAttribute("cy", "2");
                    circleElement.setAttribute("r", "2");

                    colorElement.appendChild(circleElement);

                    seriesElement.appendChild(colorElement);
                }

                labelElement.innerHTML = defaultFormatFunction(tooltipModel, tooltipModel.series, this.seriesLabelFormatString());
                seriesElement.appendChild(labelElement);
            }

            baseElement.appendChild(seriesElement);

            if(tooltipModel.measures) {
                if(tooltipModel.measures.length === 1) {
                    var measure = tooltipModel.measures[0];
                    var valueElement = document.createElement("span");
                    valueElement.innerHTML = defaultFormatFunction(tooltipModel, measure, this.measuresValueFormatString());

                    seriesElement.appendChild(valueElement);
                } else {
                    var measuresElement = document.createElement("ul");
                    measuresElement.className = "measures-container";

                    tooltipModel.measures.forEach(function(measure) {
                        var measureElement = document.createElement("li");
                        measureElement.className = "measure";

                        var labelElement = document.createElement("h3");
                        labelElement.innerHTML = defaultFormatFunction(tooltipModel, measure, this.measuresLabelFormatString());

                        measureElement.appendChild(labelElement);

                        if(measure.value != null) {
                            var valueElement = document.createElement("span");
                            valueElement.innerHTML = defaultFormatFunction(tooltipModel, measure, this.measuresValueFormatString());

                            measureElement.appendChild(valueElement);
                        }

                        measuresElement.appendChild(measureElement);
                    }, this);

                    baseElement.appendChild(measuresElement);
                }
            }

            return baseElement.innerHTML;
        }

        (pvc.ext || (pvc.ext = {})).betterTooltip = betterTooltip;

        return betterTooltip;
    }

    if(typeof define !== "undefined" && define.amd) {
        define(["cdf/lib/CCC/def", "cdf/lib/CCC/pvc", "css!./betterTooltip.css"], moduleDef);
    } else if(typeof pvc !== "undefined") {
        moduleDef(def, pvc);
    }
}());
