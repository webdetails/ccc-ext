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

    function moduleDef(def, pvc, cdo, pv) {

        var defaultInactiveCategoryLabel = "Overall",
            defaultPosition = "top",
            defaultCategoryLabelSizeH = 60,
            defaultCategoryLabelFont = "9px Open Sans",
            aggSum = function(acc, val, index) {
                return acc == null ? val :
                       val == null ? acc :
                       (acc + val);
            },
            aggAvg = function(acc, val, index) {
                if(acc == null) return val;
                // assert index > 0
                return ((acc * index) + (val || 0)) / (index + 1);
            };

        /*
        // TODO: Couldn't reproduce this case anymore.
        // How can this occur?
        pvc.LegendPanel.add({
            // Otherwise, not all subtrees are rendered when event
            // starts from one of the subtrees.
            renderInteractive: function() {
                if(this.isVisible) {
                    this.pvPanel.render();
                }
            }

            // If this were made, then renderInteractive would be fixed
            // however, the marks would become not selectable by rubber-band...
            //_getSelectableMarks: function() { return null; }
        });
        */

        // NOTE: In the following doclet, an @example tag would do code highlighting
        // but the code would be placed inside the constructor docs, not the class.

        /**
         * @class
         * @name pvc.ext.CategoryDetailsLegend
         *
         * @classdesc A category &amp; details legend,
         * that can be applied to __categorical charts__,
         * specially to the __bar__ and __point__ families.
         *
         * This is a _documentation constructor_.
         * To create an instance, use the factory function
         * {@link pvc.ext.categoryDetailsLegend}.
         *
         * ## Basic Usage
         *
         * Include the extension's JS file:
         *
         * 1. `categoryDetailsLegend.js`
         *
         * In CDE, add the file as dashboard resources.
         *
         * Then, within a CDF chart component's `preExecution` handler, write:
         * ```javascript
         * pvc.ext.categoryDetailsLegend()
         *      (this.chartDefinition);
         * ```
         *
         * ## Extension Points
         *
         * This extension adds two extension points to the chart:
         *
         * * `"legendCategoryLabel_"` — the category label; of type `pv.Label`.
         * * `"legendValueLabel_"` — the value label; of type `pv.Label`.
         *
         * You may use these to change the look of the labels but
         * note that the layout is not very robust with respect to size changes.
         *
         * ## Special Usage
         *
         * #### Changing the inactive category label text
         *
         * ```javascript
         * pvc.ext.categoryDetailsLegend()
         *      .inactiveCategoryLabel("Altiore")
         *      .install(this.chartDefinition);
         * ```
         *
         * #### Placing the legend at right
         *
         * ```javascript
         * pvc.ext.categoryDetailsLegend()
         *      .position("right")
         *      .install(this.chartDefinition);
         * ```
         *
         * #### Changing the color of the category label
         *
         * ```javascript
         * pvc.ext.categoryDetailsLegend()
         *      .install(this.chartDefinition);
         *
         * this.chartDefinition.legendCategoryLabel_textStyle = "gray";
         * ```
         *
         * #### Changing the color of the value label
         *
         * ```javascript
         * pvc.ext.categoryDetailsLegend()
         *      .install(this.chartDefinition);
         *
         * this.chartDefinition.legendValueLabel_textStyle = "gray";
         * ```
         *
         * #### Force a wider category label
         *
         * ```javascript
         * pvc.ext.categoryDetailsLegend()
         *      .categoryLabelSizeH(120)
         *      .install(this.chartDefinition);
         * ```
         *
         * ## Live examples
         *
         * [Examples page](examples/exts/categoryDetailsLegend/examples.html).
         */

        /**
         * Creates a category &amp; details legend _styler_.
         *
         * @alias categoryDetailsLegend
         * @memberOf pvc.ext
         * @function
         * @return {pvc.ext.CategoryDetailsLegend} A new legend styler.
         */
        function categoryDetailsLegend() {

            var _inactiveCategoryLabel  = defaultInactiveCategoryLabel,

                _inactiveCategoryAggMode = "sum",
                _inactiveCategoryAggFun  = aggSum,

                _position = defaultPosition,
                _categoryLabelSizeH = defaultCategoryLabelSizeH,
                _categoryLabelFont  = defaultCategoryLabelFont;

            function styler(cd, defaults) {

                var pvCategoryLabel,
                    position = _position,
                    markerSize = 20,  // diameter
                    isTop = position === "top" || position === "bottom";

                // ----------
                // Optional
                var copy = (defaults ? def.setUDefaults : def.copyOwn);
                copy(cd, {
                    tooltipEnabled: false,
                    legendFont:     "lighter 11px Open Sans"
                });

                // ----------
                // Required
                cd.legendMarkerSize = markerSize;

                cd.legendPosition = position;
                switch(position) {
                    case "left":
                    case "right":
                        cd.legendAlign = "top";
                        cd.legendPaddings = {top: 35};
                        cd.legendItemPadding = {height: 15};
                        break;

                    case "top":
                    case "bottom":
                        var requiredSize =
                                pv.Text.measureWidth(_inactiveCategoryLabel, _categoryLabelFont) +
                                pv.Text.fontHeight(_categoryLabelFont) / 2, // margin
                            categoryLabelSize = Math.max(_categoryLabelSizeH, requiredSize);

                        cd.legendAlign = "left";
                        cd.legendPaddings = {left: categoryLabelSize};
                        cd.legendItemPadding = {width: 30};
                        break;
                }

                cd.legendDrawLine =
                cd.color2AxisLegendDrawLine =
                cd.color3AxisLegendDrawLine = true;

                cd.legendDrawMarker =
                cd.color2AxisLegendDrawMarker =
                cd.color3AxisLegendDrawMarker = false;

                cd.legendArea_call = function() {

                    // CATEGORY LABEL
                    pvCategoryLabel = new pvc.visual.Label(this.sign.panel, this.anchor(isTop ? "left" : "top"), {
                            extensionId: 'categoryLabel'
                        })
                        .pvMark
                        .textAlign("left")
                        .textStyle("rgb(175, 175, 175)")
                        .font(_categoryLabelFont)
                        .text(function(itemScene) {
                            var activeScene = itemScene.chart().activeScene(),
                                activeCatView = activeScene && activeScene.asView({role: 'category'});

                            // Depends on whether there is an active category.
                            return activeCatView ? activeCatView.label : _inactiveCategoryLabel;
                        });

                    if(isTop) {
                        pvCategoryLabel
                            .top(null)
                            .left(16)
                            .bottom(3.5)
                            .textMargin(0)
                            .textBaseline("bottom");
                    } else {
                        pvCategoryLabel
                            .left(0)
                            .top(markerSize/2)
                            .textMargin(0)
                            .textBaseline("middle");
                    }

                    // The sign was added just now, but we're already in the middle
                    // of extension application, in the panel, so we have to do it ourselves.
                    pvCategoryLabel.sign.applyExtensions();
                };

                // RULE
                cd.legend$Rule_lineWidth  = pvc.finished(2);
                cd.legend$Rule_width = 24;
                cd.legend$Rule_top   = function() { return 1 + this.pvMark.lineWidth() / 2; };

                var I = pvc.visual.Interactive;
                cd.legend$Rule_ibits =
                cd.legend$Dot_ibits  = I.Selectable | I.SelectableByRubberband;

                cd.legend$Rule_imask =
                cd.legend$Dot_imask  = I.Selectable | I.SelectableByRubberband | I.SelectableByClick;

                // ITEM LABEL
                cd.legend = {
                    scenes: {
                        item: {
                            labelText: function() {
                                var itemVar = this.value();
                                // Concat the overall value, to account for its length.
                                // The "M" forces a proper minimum distance between...
                                // We undo this in #text, as the value is actually
                                // displayed in a separate label (pvValueLabel).

                                var allAggMode = _inactiveCategoryAggMode;
                                var allAggFun  = _inactiveCategoryAggFun;
                                if(!allAggFun) { // mode = "none"
                                    // Use avg to estimate the length required for when
                                    // there is an active category
                                    allAggMode = "avg";
                                    allAggFun  = aggAvg;
                                }

                                // never null when allAggFun is defined
                                var view = getItemValue(this, allAggFun, allAggMode);
                                return itemVar.label + "M" + view.label;

                            }
                        }
                    }
                };

                cd.legendTextMargin = 3 - cd.legendMarkerSize; // 3 - small adjustment
                cd.legendLabel_textMargin = 0;
                cd.legendLabel_textBaseline = "bottom";
                cd.legendLabel_textAlign    = "left";
                cd.legendLabel_top    = null;
                cd.legendLabel_bottom = 3; // small adjustment
                cd.legendLabel_text = function(itemScene) {
                    // Restore original text.
                    return itemScene.value().label;
                };
                cd.legendLabel_left = function() {
                    return this.delegate() - markerSize;
                };

                // VALUE LABEL
                cd.legendPanel_call = function() {
                    var pvValueLabel = new pvc.visual.Label(this.sign.panel, this, {
                            extensionId: 'valueLabel'
                        })
                        .pvMark
                        .right(0)
                        .top(null)
                        .bottom(0)
                        .textAlign("right")
                        .textBaseline("bottom")
                        .font("normal 11px Open Sans")
                        .text(function(itemScene) {
                            var view = getItemValue(
                                    itemScene,
                                    _inactiveCategoryAggFun,
                                    _inactiveCategoryAggMode,
                                    /*useActiveCategory*/true,
                                    /*useVisible*/true);
                            return view ? view.label : "";
                        });

                    // The sign was added just now, but we're already in the middle
                    // of extension application, in the panel, so we have to do it ourselves.
                    pvValueLabel.sign.applyExtensions();
                };

                // Listen to active category changes.
                pvc.spec.after(cd, "active:change", {
                    role: "category",
                    handler: function() {
                        activeCategoryChanged.call(this);

                        if(pvCategoryLabel) pvCategoryLabel.render();
                    }
                });

                return styler;
            }

            /**
             * Installs this extension in a given chart definition.
             *
             * The styler instance itself can be called as a function,
             * being equivalent to calling this method.
             *
             * This function defaults the properties:
             * * `legend` — `true`
             *
             * @name pvc.ext.CategoryDetailsLegend#install
             * @function
             * @param {Object} cd The chart definition to extend.
             * @param {boolean} [defaults=false] Indicates that
             * only required or optional properties not present in the chart definition are set.
             * @return {pvc.ext.CategoryDetailsLegend} This instance.
             */
            styler.install = styler;

            /** @this pvc.visual.Context */
            function activeCategoryChanged() {
                // this - possible strict violation.
                /*jshint -W040*/

                // Update Internal Legend,
                // unless already udpated, if one of `from` or `to` scenes are from the legend panel.
                var legendPanel = this.chart.legendPanel;
                if(legendPanel) {
                    var fromScene = this.event.from, toScene = this.event.to;
                    if((!fromScene || fromScene.panel() !== legendPanel) &&
                       (!toScene   || toScene  .panel() !== legendPanel)) {

                        legendPanel.renderInteractive();
                    }
                }
            }

            /**
             * Gets or sets the text to show in the category label
             * when there is no active category.
             *
             * The default label is `"Overall"`.
             *
             * @alias inactiveCategoryLabel
             * @memberOf pvc.ext.CategoryDetailsLegend#
             * @function
             * @param {boolean} [_] The new value.
             * @return {pvc.ext.CategoryDetailsLegend|boolean} The property value, when getting, `this` instance, when setting.
             */
            styler.inactiveCategoryLabel = function(_) {
                if(arguments.length) {
                    _inactiveCategoryLabel = _ != null ? String(_) : defaultInactiveCategoryLabel;
                    return styler;
                }
                return _inactiveCategoryLabel;
            };

            /**
             * Gets or sets the aggregation to perform when
             * on the values across all the categories when there is no active category.
             *
             * The default aggregation is `"sum"`.
             *
             * Possible values are:
             * * `"none"` — no aggregated value is displayed
             * * `"sum"` — values are summed
             * * `"avg"` — values are averaged
             * * a function — a custom aggregation function can be specified, with the signature:
             *    function(acc, value, index) : newAcc
             *
             * @alias inactiveCategoryAggregation
             * @memberOf pvc.ext.CategoryDetailsLegend#
             * @function
             * @param {function|string} [_] The new aggregation value.
             * @return {pvc.ext.CategoryDetailsLegend|function|string} The current property value, when getting, `this` instance, when setting.
             */
            styler.inactiveCategoryAggregation = function(_) {
                if(arguments.length) {
                    var mode, fun;
                    switch(_) {
                        case "sum": mode = _; fun = aggSum; break;
                        case "avg": mode = _; fun = aggAvg; break;

                        case "none":
                        case null:
                        case undefined: mode = "none"; fun = null; break;

                        default:
                            if(typeof _ !== "function")
                                throw new Error("Invalid value '" + _ + "' for property 'inactiveCategoryAggregation'.");
                            mode = "custom";
                            fun = _;
                    }

                    _inactiveCategoryAggMode = mode;
                    _inactiveCategoryAggFun  = fun;

                    return styler;
                }

                return _inactiveCategoryAggMode === "custom"
                    ? _inactiveCategoryAggFun
                    : _inactiveCategoryAggMode;
            };

            /**
             * Gets or sets the legend position.
             *
             * The possible values are: `"top"`, `"left"` and `"right"`.
             * The default value is `"top"`.
             *
             * @alias position
             * @memberOf pvc.ext.CategoryDetailsLegend#
             * @function
             * @param {string} [_] The new value.
             * @return {pvc.ext.CategoryDetailsLegend|string} The property value, when getting, `this` instance, when setting.
             */
            styler.position = function(_) {
                if(arguments.length) {
                    switch(_) {
                        case "top":
                        case "bottom":
                        case "right":
                        case "left":
                            break;
                        default:
                            _ = defaultPosition;
                            break;
                    }
                    _position = _;
                    return styler;
                }
                return _position;
            };

            /**
             * Gets or sets the reserved category label size, for horizontal legend orientation.
             *
             * Only applies when {@link pvc.ext.CategoryDetailsLegend#position} is `"top"`.
             *
             * The default value is `60`.
             *
             * The actual size is the maximum between the specified value and
             * the length {@link pvc.ext.CategoryDetailsLegend#inactiveCategoryLabel}
             * at the specified {@link pvc.ext.CategoryDetailsLegend#categoryLabelFont}.
             *
             * Category values that exceed the actual size are trimmed.
             *
             * @alias categoryLabelSizeH
             * @memberOf pvc.ext.CategoryDetailsLegend#
             * @function
             * @param {number} [_] The new value.
             * @return {pvc.ext.CategoryDetailsLegend|number} The property value, when getting, `this` instance, when setting.
             */
            styler.categoryLabelSizeH = function(_) {
                if(arguments.length) {
                    _categoryLabelSizeH = _ || defaultCategoryLabelSizeH;
                    return styler;
                }
                return _categoryLabelSizeH;
            };

            /**
             * Gets or sets the category label font.
             *
             * The layout is fine tuned for the default font size.
             * If the font is changed, it should be to one with a similar font height.
             *
             * The default value is `"10px sans-serif"`.
             *
             * @alias categoryLabelFont
             * @memberOf pvc.ext.CategoryDetailsLegend#
             * @function
             * @param {string} [_] The new value.
             * @return {pvc.ext.CategoryDetailsLegend|string} The property value, when getting, `this` instance, when setting.
             */
            styler.categoryLabelFont = function(_) {
                if(arguments.length) {
                    _categoryLabelFont = _ || defaultCategoryLabelFont;
                    return styler;
                }
                return _categoryLabelFont;
            };

            return styler;
        }

        // {value: , label:}
        function getItemValue(itemScene, allCatsAggFun, allCatsAggMode, useActiveCategory, useVisible) {

            var chart = itemScene.chart(),
                catDimNames = chart.visualRoles.category.grouping.dimensionNames(),
                valueDimName = chart.visualRoles.value.firstDimensionName(),
                activeCatView, result, activeValuesByCategory, valueCacheKey;

            if(useActiveCategory) {
                var activeScene = itemScene.chart().activeScene();
                if(activeScene) activeCatView = activeScene.asView({role: 'category'});
            }

            if(activeCatView) {
                // No aggregation.
                valueCacheKey = "__valueActive" + (useVisible ? "Visible" : "")
                activeValuesByCategory = def.lazy(itemScene, valueCacheKey);

                result = def.getOwn(activeValuesByCategory, activeCatView.key);
            } else if(allCatsAggFun) {
                valueCacheKey = "__valueInactive" + (useVisible ? "Visible_" : "_") + allCatsAggMode;
                result = itemScene[valueCacheKey];
            } else {
                // No all_cats/inactive_cat aggregation. Show nothing.
                return null;
            }

            if(!result) {
                var getDatumValue = function(datum) {
                            return datum.atoms[valueDimName].value;
                        };

                // When there is an active category, just sum up the values of every datum
                // having that category. Categorical charts do this for each distinct pair
                // of <series, category>, cause these are assumed to be keys of the data.
                //
                // In the legend, however, item scenes are generated per distinct value of
                // the "color" visual role, per color axis, per data part, and what not...
                // For simple charts, with default mappings, the color role defaults to
                // whatever is in the series role, and so the two are aligned.
                //
                // In other cases, I'm not sure that summing for distinct <color, value> pairs
                // still makes sense...
                //
                // When there is no active category, first we group per category and sum
                // the datums' values for each category.
                // Then, all category values are aggregated using allCatsAggFun.
                var value;
                if(activeCatView) {
                    // Fast, no memory allocation test (compared to computing category key).
                    var hasActiveCategory = function(datum) {
                                var i = catDimNames.length;
                                while(i--)
                                    if(activeCatView.atoms[catDimNames[i]].value
                                        !==
                                       datum.atoms[catDimNames[i]].value)
                                        return false;

                                return true;
                            };

                    value = itemScene.datums()
                            .where(function(datum) {
                                return (!useVisible || datum.isVisible) &&
                                       !datum.isNull &&
                                       hasActiveCategory(datum);
                            })
                            .select(getDatumValue)
                            .reduce(aggSum, null);
                } else {
                    // Group By
                    var datumsByCatKey = itemScene.datums()
                            .where(function(datum) {
                                return (!useVisible || datum.isVisible) && !datum.isNull;
                            })
                            .multipleIndex(function(datum) {
                                return cdo.Complex.compositeKey(datum, catDimNames);
                            });

                    // Agg over categories
                    var index = 0;
                    value = def.query(def.ownKeys(datumsByCatKey))
                        .select(function(catKey) {
                            // Sum per category
                            return def.query(datumsByCatKey[catKey])
                                .select(getDatumValue)
                                .reduce(aggSum, null);
                        })
                        .reduce(function(acc, val) {
                            return allCatsAggFun(acc, val, index++);
                        }, null);
                }

                result = {
                    value: value,
                    label: chart.data.owner.dimensions(valueDimName).format(value)
                };

                if(activeCatView)
                    activeValuesByCategory[activeCatView.key] = result;
                else
                    itemScene[valueCacheKey] = result;
            }

            return result;
        }

        (pvc.ext || (pvc.ext = {})).categoryDetailsLegend = categoryDetailsLegend;

        return categoryDetailsLegend;
    }

    /*global define:true, pvc:true, def:true, pv:true */
    if(typeof define !== "undefined" && define.amd) {

        define(["cdf/lib/CCC/def",
                "cdf/lib/CCC/pvc",
                "cdf/lib/CCC/cdo",
                "cdf/lib/CCC/protovis"
            ], moduleDef);

    } else if(typeof pvc !== "undefined") {
        moduleDef(def, pvc, cdo, pv);
    }
}());
