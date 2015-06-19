/*!
 * Copyright 2002 - 2015 Webdetails, a Pentaho company.  All rights reserved.
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

    function moduleDef(def, pvc) {

        var defaultAxis = "base";

        /**
         * @class
         * @name pvc.ext.BandCenteredGridlines
         *
         * @classdesc An extension that
         * centers the gridlines of discrete cartesian axes.
         *
         * This extension works best
         * with a discrete base _line_ chart or with a _heat-grid_ chart.
         *
         * This is a _documentation constructor_.
         * To create an instance, use the factory function
         * {@link pvc.ext.bandCenteredGridlines}.
         *
         * ## Basic Usage
         *
         * Include the extension's JS file:
         *
         * 1. `bandCenteredGridlines.js`
         *
         * In CDE, add the file or files as dashboard resources.
         *
         * Then, within a CDF chart component's `preExecution` handler, write:
         * ```javascript
         * pvc.ext.bandCenteredGridlines()
         *      (this.chartDefinition);
         * ```
         *
         * This centers the base axis' gridlines.
         *
         * ## Special Usage
         *
         * #### Centering the ortho axis' gridlines
         *
         * ```javascript
         * pvc.ext.bandCenteredGridlines()
         *      .axis("ortho")
         *      .install(this.chartDefinition);
         * ```
         *
         * #### Centering both gridlines
         *
         * ```javascript
         * pvc.ext.categoryDetailsLegend()
         *      .axis("both")
         *      .install(this.chartDefinition);
         * ```
         *
         * ## Live examples
         *
         * [Examples page](examples/exts/bandCenteredGridlines/examples.html).
         */

        /**
         * Creates a band centered axis gridlines _styler_.
         *
         * @alias bandCenteredGridlines
         * @memberOf pvc.ext
         * @function
         * @return {pvc.ext.BandCenteredGridlines} A new styler.
         */
        function bandCenteredGridlines() {

            var _axis = defaultAxis;

            function styler(cd, defaults) {

                var options = {};

                if(_axis === "ortho" || _axis === "both") {
                    options.orthoAxisGrid = true;
                    centerAxisGridlines(cd, "ortho"); // Required
                }

                if(_axis === "base"  || _axis === "both") {
                    options.baseAxisGrid  = true;
                    centerAxisGridlines(cd, "base"); // Required
                }

                // Optional
                var copy = (defaults ? def.setUDefaults : def.copyOwn);
                copy(cd, options);

                return styler;
            }

            /**
             * Installs this extension in a given chart definition.
             *
             * The styler instance itself can be called as a function,
             * being equivalent to calling this method.
             *
             * This function may default the properties:
             * * `baseAxisGrid`
             * * `orthoAxisGrid`
             *
             * Also, this function specifies the extension points
             *  `baseAxisGrid_visible`, `baseAxisGrid_left`, `baseAxisGrid_bottom`
             *   and/or
             *  `orthoAxisGrid_visible`, `orthoAxisGrid_left`, `orthoAxisGrid_bottom`.
             *
             * @name pvc.ext.BandCenteredGridlines#install
             * @function
             * @param {Object} cd The chart definition to extend.
             * @param {boolean} [defaults=false] Indicates that
             * only required or optional properties not present in the chart definition are set.
             * @return {pvc.ext.BandCenteredGridlines} This instance.
             */
            styler.install = styler;

            /**
             * Gets or sets the gridlines's axis.
             *
             * The possible values are: `"base"`, `"ortho"` and `"both"`.
             * The default value is `"base"`.
             *
             * @alias axis
             * @memberOf pvc.ext.BandCenteredGridlines#
             * @function
             * @param {string} [_] The new value.
             * @return {pvc.ext.BandCenteredGridlines|string} The property value, when getting, `this` instance, when setting.
             */
            styler.axis = function(_) {
                if(arguments.length) {
                    switch(_) {
                        case "base":
                        case "ortho":
                        case "both":
                            break;
                        default:
                            _ = defaultAxis;
                            break;
                    }
                    _axis = _;
                    return styler;
                }
                return _axis;
            };

            return styler;
        }

        function centerAxisGridlines(cd, axisType) {

            cd[axisType + "AxisGrid_visible"] = function(s) {
                return this.pvMark.index < s.parent.childNodes.length;
            };

            cd[axisType + "AxisGrid_left"]   = gridLeft;
            cd[axisType + "AxisGrid_bottom"] = gridBottom;

            function gridLeft() {
                var offset = 0;

                // Switch-off if not discrete axis.
                if(this.chart.axes.x.scaleType === 'discrete') {

                    var isV = this.chart.isOrientationVertical();

                    if((axisType === "base"  && isV) || (axisType === "ortho" && !isV)) {
                        var scale = this.panel.axes[axisType].scale;
                        offset = scale.range().step / 2;
                    }
                }

                return this.delegate() + offset;
            }

            function gridBottom() {
                var offset = 0;

                // Switch-off if not discrete axis.
                if(this.chart.axes.y.scaleType === 'discrete') {

                    var isH = this.chart.isOrientationHorizontal();

                    if((axisType === "base"  && isH) || (axisType === "ortho" && !isH)) {
                        var scale = this.panel.axes[axisType].scale;
                        offset = scale.range().step / 2;
                    }
                }

                return this.delegate() + offset;
            }
        }

        (pvc.ext || (pvc.ext = {})).bandCenteredGridlines = bandCenteredGridlines;

        return bandCenteredGridlines;
    }

    /*global define:true, pvc:true, def:true */
    if(typeof define !== "undefined" && define.amd) {

        define(["cdf/lib/CCC/def",
                "cdf/lib/CCC/pvc"
            ], moduleDef);

    } else if(typeof pvc !== "undefined") {
        moduleDef(def, pvc);
    }
}());
