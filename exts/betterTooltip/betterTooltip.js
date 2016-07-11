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
