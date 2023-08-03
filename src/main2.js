/*
 * Copyright © 2020. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */

//@ts-check - Get type warnings from the TypeScript language server. Remove if not wanted.

/**
 * Get access to the Spotfire Mod API by providing a callback to the initialize method.
 * @param {Spotfire.Mod} mod - mod api
 */
Spotfire.initialize(async (mod) => {
    /**
     * Create the read function.
     */
    const reader = mod.createReader(mod.visualization.data(), mod.windowSize(), mod.property("myProperty"));

    /**
     * Store the context.
     */
    const context = mod.getRenderContext();

    /**
     * Initiate the read loop
     */
    reader.subscribe(render);

    /**
     * @param {Spotfire.DataView} dataView
     * @param {Spotfire.Size} windowSize
     * @param {Spotfire.ModProperty<string>} prop
     */
    async function render(dataView, windowSize, prop) {
        /**
         * Check the data view for errors
         */
        let errors = await dataView.getErrors();
        if (errors.length > 0) {
            // Showing an error overlay will hide the mod iframe.
            // Clear the mod content here to avoid flickering effect of
            // an old configuration when next valid data view is received.
            mod.controls.errorOverlay.show(errors);
            return;
        }
        mod.controls.errorOverlay.hide();

        /**
         * Get the hierarchy of the categorical X-axis.
         */
        const xHierarchy = await dataView.hierarchy("X");
        const xRoot = await xHierarchy.root();

        if (xRoot == null) {
            // User interaction caused the data view to expire.
            // Don't clear the mod content here to avoid flickering.
            return;
        }

        /**
         * org chart parsers starts here
         */


        const data = d3.csvParse(demoData);
        console.log(data);


        // const axes = await dataView.axes();
        // const rows = await dataView.allRows();
        // rows.forEach((row,i) => {
        //     console.log(i,  axes.map(axis => {
        //         if(axis.isCategorical){
        //             return row.categorical(axis.name).formattedValue()
        //         }
        //         return row.continuous(axis.name).value()
        //     }).join(","));

        // });


        var chart;
        let dataFlattened = d3.csvParse(demoData);

        

        chart = new d3.OrgChart()
            .container('.chart-container')
            .data(dataFlattened)
            .rootMargin(100)
            .nodeWidth((d) => 210)
            .nodeHeight((d) => 140)
            .childrenMargin((d) => 130)
            .compactMarginBetween((d) => 75)
            .compactMarginPair((d) => 80)
            .linkUpdate(function (d, i, arr) {
                d3.select(this)
                    .attr('stroke', (d) =>
                        d.data._upToTheRootHighlighted ? '#152785' : 'lightgray'
                    )
                    .attr('stroke-width', (d) =>
                        d.data._upToTheRootHighlighted ? 5 : 1.5
                    )
                    .attr('stroke-dasharray', '4,4');

                if (d.data._upToTheRootHighlighted) {
                    d3.select(this).raise();
                }
            })
            .nodeContent(function (d, i, arr, state) {
                const colors = [
                    '#6E6B6F',
                    '#18A8B6',
                    '#F45754',
                    '#96C62C',
                    '#BD7E16',
                    '#802F74',
                ];
                const color = colors[d.depth % colors.length];
                const imageDim = 80;
                const lightCircleDim = 95;
                const outsideCircleDim = 110;

                return `
                  <div style="background-color:white; position:absolute;width:${d.width}px;height:${d.height}px;">
                     <div style="background-color:${d.data.size};position:absolute;margin-top:-${outsideCircleDim / 2}px;margin-left:${d.width / 2 - outsideCircleDim / 2}px;border-radius:100px;width:${outsideCircleDim}px;height:${outsideCircleDim}px;"></div>
                     <div style="background-color:#ffffff;position:absolute;margin-top:-${lightCircleDim / 2}px;margin-left:${d.width / 2 - lightCircleDim / 2}px;border-radius:100px;width:${lightCircleDim}px;height:${lightCircleDim}px;"></div>
                     <img src=" ${d.data.imageUrl}" style="position:absolute;margin-top:-${imageDim / 2}px;margin-left:${d.width / 2 - imageDim / 2}px;border-radius:100px;width:${imageDim}px;height:${imageDim}px;" />
                     <div class="card" style="top:${outsideCircleDim / 2 + 10}px;position:absolute;height:30px;width:${d.width}px;background-color:#3AB6E3;">
                        <div style="background-color:${d.data.size};height:28px;text-align:center;padding-top:10px;color:#ffffff;font-weight:bold;font-size:16px">
                            ${d.data.name} 
                        </div>
                        <div style="background-color:#F0EDEF;height:28px;text-align:center;padding-top:10px;color:#424142;font-size:16px">
                            ${d.data.positionName} 
                        </div>
                     </div>
                 </div>
        `;
            })
            .render();





        /**
         * Print out to document
         */
        // const container = document.querySelector("#mod-container");
        // container.textContent = `windowSize: ${windowSize.width}x${windowSize.height}\r\n`;

        /**
         * Signal that the mod is ready for export.
         */
        context.signalRenderComplete();
    }
});
