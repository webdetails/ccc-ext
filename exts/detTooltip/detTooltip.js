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
         * @name pvc.ext.DetTooltip
         *
         * @classdesc A rich HTML tooltip.
         *
         * To create an instance, use the factory function
         * {@link pvc.ext.detTooltip}.
         *
         * ## Basic Usage
         * Include the extension's files:
         *
         * 1. `detTooltip.js`
         * 2. `detTooltip.css`
         *
         * (If using AMD/Require-JS, the "css" AMD plugin must be registered and
         * will automatically load the accompanying stylesheet).
         *
         * In CDE, add the file or files as dashboard resources.
         *
         * Then, within a CDF chart component's `preExecution` handler, write:
         * ```javascript
         * pvc.ext.detTooltip()
         *      .install(this.chartDefinition);
         * ```
         *
         * ## Usage
         *
         * #### Displaying values in percentage, fallback to value if not available
         *
         * ```javascript
         * pvc.ext.detTooltip()
         *      .measuresValueFormatString("{value.percent.label|value.label}")
         *      .install(this.chartDefinition);
         * ```
         * ## Live examples
         *
         * [Examples page](examples/exts/detTooltip/examples.html).
         */

        /**
         * Creates a rich HTML tooltip formatter.
         * @alias detTooltip
         * @memberOf pvc.ext
         * @function
         * @return {pvc.ext.DetTooltip} A new tooltip formatter.
         */
        function detTooltip() {
            var _categoryLabelFormatString = "{label}:&nbsp;{value.label}";
            var _categoryLabelFormatFunction = defaultFormatFunction;

            var _seriesLabelFormatString = "{value.label}";
            var _seriesLabelFormatFunction = defaultFormatFunction;

            var _measuresLabelFormatString = "{label}";
            var _measuresLabelFormatFunction = defaultFormatFunction;

            var _measuresValueFormatString = "{value.label}";
            var _measuresValueFormatFunction = defaultFormatFunction;

            var _groupLabelFormatString = "{label}";
            var _groupLabelFormatFunction = defaultFormatFunction;

            function formatter(cd, defaults) {
                // Optional
                var copy = (defaults ? def.setUDefaults : def.copyOwn);
                copy(cd, {
                    tooltipEnabled:     true,
                    tooltipOpacity:     1,
                    tooltipGravity:     "s",
                    tooltipClassName:   "ccc-ext-det-tooltip",
                    tooltipFollowMouse: true
                });

                // Required
                cd.tooltipFormat = formatter.format;
                cd.axisTooltipFormat = formatter.axisTickLabelsFormat;
                cd.legendLabel_tooltip = formatter.legendLabelsFormat;
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
             * * `tooltipClassName` — `"ccc-ext-det-tooltip"`
             * * `tooltipFollowMouse` — `true`
             *
             * This function sets the required properties `tooltipFormat` and `axisTooltipFormat`.
             *
             * @name pvc.ext.DetTooltip#install
             * @function
             *
             * @param {Object} cd - The chart definition to extend.
             * @param {boolean} [defaults=false] - Indicates that only required or optional
             *                                     properties not present in the chart definition
             *                                     are set.
             *
             * @return {pvc.ext.DetTooltip} This instance.
             */
            formatter.install = formatter;

            /**
             * Formats an HTML tooltip for a given scene.
             *
             * This function can be called on any `this` context,
             * and will always exhibit the same behavior.
             *
             * Normally you would not use this function directly,
             * as {@link pvc.ext.DetTooltip#install}
             * sets this as the chart"s `tooltipFormat` for you.
             *
             * @alias format
             * @memberOf pvc.ext.DetTooltip#
             * @function
             *
             * @param {pvc.visual.Scene} scene - The categorical scene for which to render the tooltip.
             *
             * @return {string} The tooltip HTML string.
             */
            formatter.format = function(scene) {
                var model = buildModel.call(formatter, scene);

                return detTooltipRenderer.call(formatter, model);
            };

            /**
             * Formats an HTML tooltip for the current axis tick in the scene.
             *
             * Normally you would not use this function directly,
             * as {@link pvc.ext.DetTooltip#install}
             * sets this as the chart"s `axisTooltipFormat` for you.
             *
             * @alias axisTickLabelsFormat
             * @memberOf pvc.ext.DetTooltip#
             * @function
             *
             * @param {pvc.visual.Scene} scene - The scene of the tick for which to render the tooltip.
             *
             * @return {string} The tooltip HTML string.
             */
            formatter.axisTickLabelsFormat = function(scene) {
                return this.pvMark.textAngle() || (this.pvMark.text() !== scene.vars.tick.label) ? detTooltipRenderer.call(formatter, {groups: scene.groups}) : "";
            };

            /**
             * Formats an HTML tooltip for a legend item.
             *
             * Normally you would not use this function directly,
             * as {@link pvc.ext.DetTooltip#install}
             * sets this as the chart"s `legendLabel_tooltip` for you.
             *
             * @alias legendLabelsFormat
             * @memberOf pvc.ext.DetTooltip#
             * @function
             *
             * @param {pvc.visual.Scene} scene - The scene of the legend label for which to render the tooltip.
             *
             * @return {string} The tooltip HTML string.
             */
            formatter.legendLabelsFormat = function(scene) {
                var valueText = scene.vars.value.absLabel || scene.vars.value.label;

                return (this.pvMark.text() !== valueText) ? detTooltipRenderer.call(formatter, {groups: scene.groups}) : "";
            };

            /**
             * Gets or sets the format string for the label of the category. Used by the default label formatter.
             *
             * Defaults to "{label}:&nbsp;{value.label}".
             *
             * @alias categoryLabelFormatString
             * @memberOf pvc.ext.DetTooltip#
             * @function
             *
             * @param {string} [_] - The new value.
             *
             * @return {pvc.ext.DetTooltip|string} The property value, when getting; `this` instance, when setting.
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
             * Custom formatters receive the full tooltip model object, the category being formatted and the
             * current value of the categoryLabelFormatString property. Must return the formatted label.
             *
             * @alias categoryLabelFormatFunction
             * @memberOf pvc.ext.DetTooltip#
             * @function
             *
             * @param {function} [_] - The new value.
             *
             * @return {pvc.ext.DetTooltip|function} The property value, when getting; `this` instance, when setting.
             */
            formatter.categoryLabelFormatFunction = function(_) {
                if(arguments.length) {
                    _categoryLabelFormatFunction = _;
                    return formatter;
                }

                return _categoryLabelFormatFunction;
            };

            /**
             * Gets or sets the format string for the label of the series. Used by the default label formatter.
             *
             * Defaults to "{value.label}".
             *
             * @alias seriesLabelFormatString
             * @memberOf pvc.ext.DetTooltip#
             * @function
             *
             * @param {string} [_] - The new value.
             *
             * @return {pvc.ext.DetTooltip|string} The property value, when getting; `this` instance, when setting.
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
             * Custom formatters receive the full tooltip model object, the series being formatted and the
             * current value of the seriesLabelFormatString property. Must return the formatted label.
             *
             * @alias seriesLabelFormatFunction
             * @memberOf pvc.ext.DetTooltip#
             * @function
             *
             * @param {function} [_] - The new value.
             *
             * @return {pvc.ext.DetTooltip|function} The property value, when getting; `this` instance, when setting.
             */
            formatter.seriesLabelFormatFunction = function(_) {
                if(arguments.length) {
                    _seriesLabelFormatFunction = _;
                    return formatter;
                }

                return _seriesLabelFormatFunction;
            };

            /**
             * Gets or sets the format string for the label of the measures. Used by the default label formatter.
             *
             * Defaults to "{label}".
             *
             * @alias measuresLabelFormatString
             * @memberOf pvc.ext.DetTooltip#
             * @function
             *
             * @param {string} [_] - The new value.
             *
             * @return {pvc.ext.DetTooltip|string} The property value, when getting; `this` instance, when setting.
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
             * Custom formatters receive the full tooltip model object, the measure being formatted and the
             * current value of the measuresLabelFormatString property. Must return the formatted label.
             *
             * @alias measuresLabelFormatFunction
             * @memberOf pvc.ext.DetTooltip#
             * @function
             *
             * @param {function} [_] - The new value.
             *
             * @return {pvc.ext.DetTooltip|function} The property value, when getting; `this` instance, when setting.
             */
            formatter.measuresLabelFormatFunction = function(_) {
                if(arguments.length) {
                    _measuresLabelFormatFunction = _;
                    return formatter;
                }

                return _measuresLabelFormatFunction;
            };

            /**
             * Gets or sets the format string for the value of the measures. Used by the default label formatter.
             *
             * Defaults to "{value}".
             *
             * @alias measuresValueFormatString
             * @memberOf pvc.ext.DetTooltip#
             * @function
             *
             * @param {string} [_] - The new value.
             *
             * @return {pvc.ext.DetTooltip|string} The property value, when getting; `this` instance, when setting.
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
             * Custom formatters receive the full tooltip model object, the measure being formatted and the
             * current value of the measuresValueFormatString property. Must return the formatted value.
             *
             * @alias measuresValueFormatFunction
             * @memberOf pvc.ext.DetTooltip#
             * @function
             *
             * @param {function} [_] - The new value.
             *
             * @return {pvc.ext.DetTooltip|function} The property value, when getting; `this` instance, when setting.
             */
            formatter.measuresValueFormatFunction = function(_) {
                if(arguments.length) {
                    _measuresValueFormatFunction = _;
                    return formatter;
                }

                return _measuresValueFormatFunction;
            };

            /**
             * Gets or sets the format string for a group. Used by the default label formatter.
             *
             * Defaults to "{label}".
             *
             * @alias groupLabelFormatString
             * @memberOf pvc.ext.DetTooltip#
             * @function
             *
             * @param {string} [_] - The new value.
             *
             * @return {pvc.ext.DetTooltip|string} The property value, when getting; `this` instance, when setting.
             */
            formatter.groupLabelFormatString = function(_) {
                if(arguments.length) {
                    _groupLabelFormatString = _;
                    return formatter;
                }

                return _groupLabelFormatString;
            };

            /**
             * Gets or sets the format function for a group.
             *
             * The default format function uses the categoryLabelFormatString property for creating the label.
             *
             * Custom formatters receive the full tooltip model object, the category being formatted and the
             * current value of the categoryLabelFormatString property. Must return the formatted label.
             *
             * @alias groupLabelFormatFunction
             * @memberOf pvc.ext.DetTooltip#
             * @function
             *
             * @param {function} [_] - The new value.
             *
             * @return {pvc.ext.DetTooltip|function} The property value, when getting; `this` instance, when setting.
             */
            formatter.groupLabelFormatFunction = function(_) {
                if(arguments.length) {
                    _groupLabelFormatFunction = _;
                    return formatter;
                }

                return _groupLabelFormatFunction;
            };

            return formatter;
        }

        /**
         * Builds the tooltip model from the CCC scene information.
         *
         * @param {Object} scene - The CCC scene.
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
                } else if(tooltipModels.measures.length > 0) {
                    var firstMeasure = tooltipModels.measures[0]
                    value = {value: firstMeasure.value, label: ""};

                    if(tooltipModels.category && (!series || tooltipModels.measures.length > 1)) {
                        value.label = tooltipModels.category.value.label;
                        tooltipModels.category = null;
                    } else {
                        value.label = firstMeasure.label;
                    }
                }

                return value ? {color: color, value: value, label: (series && series.label) || ""} : null;
            }
        }

        /**
         * The default format function replaces tokens in the received format string
         * with values from the current tooltipModel subject (category, series, measure).
         *
         * @param {Object} tooltipModel - The tooltip model object (not used by the default formatter).
         * @param {Object} subject - The current tooltip subject being formatted.
         * @param {string} formatString - The format string.
         *
         * @return {string} The formatted text.
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
         * and having the formatter instance as `this` context.
         *
         * @param {Object} tooltipModel - The tooltip model object.
         *
         * @return {string} The HTML of the rendered tooltip.
         */
        function detTooltipRenderer(tooltipModel) {
            var baseElement = document.createElement("div");

            if(tooltipModel.groups) {
                var axisTickLabelsElement = document.createElement("ul");
                axisTickLabelsElement.className = "axis-tick-label-container";

                tooltipModel.groups.forEach(function(group) {
                    var axisLabelElement = document.createElement("li");
                    axisLabelElement.className = "group-label";

                    var labelElement = document.createElement("h1");
                    labelElement.innerHTML = defaultFormatFunction(tooltipModel, group, this.groupLabelFormatString());

                    axisLabelElement.appendChild(labelElement);

                    axisTickLabelsElement.appendChild(axisLabelElement);
                }, this);

                baseElement.appendChild(axisTickLabelsElement);
            }

            if(tooltipModel.category) {
                var titleElement = document.createElement("h1");
                titleElement.innerHTML = defaultFormatFunction(tooltipModel, tooltipModel.category, this.categoryLabelFormatString());

                baseElement.appendChild(titleElement);
            }

            if(tooltipModel.series != null) {
                var seriesElement = document.createElement("div");
                seriesElement.className = "series";

                var labelElement = document.createElement("h2");

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
            }

            return baseElement.innerHTML;
        }

        (pvc.ext || (pvc.ext = {})).detTooltip = detTooltip;

        return detTooltip;
    }

    if(typeof define !== "undefined" && define.amd) {
        define(["cdf/lib/CCC/def", "cdf/lib/CCC/pvc", "css!./detTooltip.css"], moduleDef);
    } else if(typeof pvc !== "undefined") {
        moduleDef(def, pvc);
    }
}());
