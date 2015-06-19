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

    function moduleDef(def, pvc, pv) {

        // -------------------------
        // Extensions to CCC classes

        /*
        pvc.parseHairFollow =
            pvc.makeEnumParser('hairFollow', ['mouse', 'active'], 'active');
        */

        // For axis.index > 0 resolves with null, otherwise resolves fully.
        function resolveFullOnlyFirst(optionInfo) {
            return (this.index > 0) ? (optionInfo.specify(null), true) : this._resolveFull(optionInfo);
        }

        pvc.visual.CartesianAxis.options({
            // The 1st axis of each orientation determines if the hair is on in that orientation.
            // The other axes options are ignored.
            Hair: {
                resolve: resolveFullOnlyFirst,
                cast:  Boolean,
                value: false
            }
            /*
            // Only applies if Hair: true.
            // The 1st axis of each orientation also specifies if
            // the hair follows the mouse or the active plot visual element.
            //
            // Only know for sure if an axis is discrete or continuous
            // after binding to data cells.
            // "mouse" can only be used for continuous axes.
            HairFollow: {
                resolve: resolveFullOnlyFirst,
                cast:    pvc.parseHairFollow,
                value:   'active'
            },

            // Only applies if the first axis of same orientation has Hair: true.
            // For any cartesian axes,
            // specifies whether it shows a label with the corresponding hair's value on its scale.
            HairLabel: {
                resolve: '_resoveFull',
                cast:    Boolean,
                value:   false
            }
            */
        });

        pvc.CartesianGridDockingPanel.add({

            /** @override */
            _createCore: function(layoutInfo) {

                this.base(layoutInfo);

                var axes = this.chart.axes;

                this._createHair(axes.x);
                this._createHair(axes.y);
            },

            _createHair: function(axis) {
                var scale, rootScene;

                if(!axis.isBound() ||
                   !axis.option('Hair') ||
                   (scale = axis.scale).isNull ||

                   // Composite axes don't fill ticks
                   !(rootScene = this._getAxisHairRootScene(axis))) return;

                var margins   = this._layoutInfo.gridMargins,
                    paddings  = this._layoutInfo.gridPaddings,

                    tick_a = axis.orientation === 'x' ? 'left' : 'bottom',
                    len_a  = this.anchorLength(tick_a),
                    obeg_a = this.anchorOrtho(tick_a),
                    oend_a = this.anchorOpposite(obeg_a),

                    mainPlot = this.chart.plotPanelList[0],
                    tick_offset = axis.orientation === 'x'
                        // mainPlot.isVisible ?
                        ? ((mainPlot.position.left   || 0) + paddings.left  )
                        : ((mainPlot.position.bottom || 0) + paddings.bottom),
                    obeg = margins[obeg_a],
                    oend = margins[oend_a];

                var pvHairRule = new pvc.visual.Rule(this, this.pvPanel, {
                        extensionId: axis.extensionPrefixes.map(function(prefix) { return prefix + 'HairRule'; })
                    })
                    .lock('data', rootScene.leafs().array())
                    .lock('visible', function(tickScene) {
                        var activeScene = this.chart.activeScene();
                        return !!activeScene && isAtomsSubsetOf(tickScene.atoms, activeScene.atoms);
                    })
                    .lock(len_a, null)
                    .override('defaultColor', def.fun.constant(pv.color("#CCC")))
                    .pvMark
                    .antialias(true)
                    [obeg_a](obeg)
                    [oend_a](oend)
                    [tick_a](function(tickScene) {
                        return tick_offset + scale(tickScene.vars.tick.value);
                    })
                    .zOrder(-7)
                    .events('none');

                this.chart.after("active:change", function() {
                    pvHairRule.render();
                });

                return pvHairRule;
            },

            /** @override */
            _getAxisGridRootScene: function(axis) {
                // Reuse the same scenes for both grids and hairs.
                var cacheById = def.lazy(this, "_gridRootSceneCache"),
                    rootScene = def.getOwn(cacheById, axis.id);
                if(!rootScene) rootScene = cacheById[axis.id] = this.base(axis);
                return rootScene;
            },

            _getAxisHairRootScene: function(axis) {
                if(axis.role.grouping.isDiscrete())
                    return this._getAxisGridRootScene(axis);

                // Return scenes identical to the discrete scenes.
                var data = axis.domainData(),
                    rootScene = new pvc.visual.CartesianAxisRootScene(null, {
                            panel:  this,
                            source: data
                        });

                data.childNodes.forEach(function(tickData) {
                    new pvc.visual.CartesianAxisTickScene(rootScene, {
                        source:    tickData,
                        tick:      tickData.value,
                        tickRaw:   tickData.rawValue,
                        tickLabel: tickData.label
                    });
                });

                return rootScene;
            }
        });

        function isAtomsSubsetOf(atomsA, atomsB) {
            var atomA, atomB;
            for(var dimName in atomsA) {
                atomA = atomsA[dimName];
                if(atomA.value !== null) {
                    atomB = atomsB[dimName];
                    if(atomA !== atomB) return false;
                }
            }
            return true;
        }

        /**
         * @class
         * @name pvc.ext.Crosshair
         *
         * @classdesc An extension that
         * adds support for crosshair to __cartesian__ charts,
         * specially __point__, __scatter__ or heat-grid charts.
         *
         * It can show the _base_ and/or _orthogonal_ hair lines (see {@link pvc.ext.Crosshair#axis}).
         *
         * It can show labels with the corresponding values
         * on each of the chart axes (see {@link pvc.ext.Crosshair#axesLabels}).
         *
         * For the continuous dimensions (base and/or ortho),
         * the hairs can either track the _active plot visual element_ or
         * the _mouse_, in which case the hair disappears when
         * the mouse moves off the plot area (see {@link pvc.ext.Crosshair#follow}).
         *
         * This extension works well, visually,
         * with the extension {@link pvc.ext.BandCenteredGridlines}.
         *
         * This is a _documentation constructor_.
         * To use this extension, just include the required files and
         * specify the _hair_ options.
         *
         * ## Basic Usage
         *
         * Include the extension JS file:
         *
         * 1. `crossHair.js`
         *
         * In CDE, add the file or files as dashboard resources.
         *
         * Then, within a CDF chart component's `preExecution` handler, write:
         *
         * ```javascript
         * $.extend(this.chartDefinition, {
         *     hoverable:    true,
         *     baseAxisHair: true
         * });
         * ```
         *
         * This activates the base axis' hair line,
         * configured to follow the active visual element.
         *
         * Along with the base axis' hair, it results well to collapse the "y" coordinate
         * in the pointing behavior:
         *
         * ```javascript
         * $.extend(this.chartDefinition, {
         *     hoverable:    true,
         *     baseAxisHair: true,
         *     pointing:     {collapse: "y"}
         * });
         * ```
         *
         * ## Extension Points
         *
         * This extension adds extension points to the chart.
         *
         * To the first _base_ and _ortho_ axes:
         * * `"baseAxisHairRule"`  — the rule of the _base_ axis' hair.
         * * `"orthoAxisHairRule"` — the rule of the _ortho_ axis' hair.
         *
         * ## Live examples
         *
         * [Examples page](examples/exts/crosshair/examples.html).
         */

         /* TODO
          * To every cartesian axis (base, ...):
          * * `"<axis>AxisHairPanel"` — the panel that surrounds the hair label of the axis.
          * * `"<axis>AxisHairLabel"` — the hair label of the axis.
          *
          * &lt;axis&gt; can be "base", "ortho", "ortho2", "x", "y", etc.
          */
    }

    /*global define:true, pvc:true, def:true, pv:true */
    if(typeof define !== "undefined" && define.amd) {

        define(["cdf/lib/CCC/def",
                "cdf/lib/CCC/pvc",
                "cdf/lib/CCC/protovis"
            ], moduleDef);

    } else if(typeof pvc !== "undefined") {
        moduleDef(def, pvc, pv);
    }
}());
