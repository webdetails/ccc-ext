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

        function betterTooltip() {
            
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

            formatter.install = formatter;

            formatter.format = function(scene) {
                var model = buildModel.call(formatter, scene);

                return betterTooltipRenderer.call(formatter, model);
            };

            return formatter;
        }

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

        function betterTooltipRenderer(tooltipModel) {
            
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
