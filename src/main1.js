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
        // console.log(data);


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


        let dataFlattened = d3.csvParse(demoData);

        var chart = new d3.OrgChart()
          .container('.chart-container')
          .data(dataFlattened)
          .nodeHeight((d) => 85)
          .nodeWidth((d) => 220)
          .childrenMargin((d) => 50)
          .compactMarginBetween((d) => 25)
          .compactMarginPair((d) => 50)
        //   .neightbourMargin((a, b) => 25)
        //   .siblingsMargin((d) => 25)
          .buttonContent(({ node, state }) => {
            return `<div style="px;color:#716E7B;border-radius:5px;padding:4px;font-size:10px;margin:auto auto;background-color:white;border: 1px solid #E4E2E9"> <span style="font-size:9px">${
              node.children
                ? `<i class="fas fa-angle-up"></i>`
                : `<i class="fas fa-angle-down"></i>`
            }</span> ${node.data._directSubordinates}  </div>`;
          })
          .linkUpdate(function (d, i, arr) {
            d3.select(this)
              .attr('stroke', (d) =>
                d.data._upToTheRootHighlighted ? '#152785' : '#E4E2E9'
              )
              .attr('stroke-width', (d) =>
                d.data._upToTheRootHighlighted ? 5 : 1
              );

            if (d.data._upToTheRootHighlighted) {
              d3.select(this).raise();
            }
          })
          .nodeContent(function (d, i, arr, state) {
            const color = '#FFFFFF';

            const template1 = `
            <div style="font-family: 'Inter', sans-serif;background-color:${color}; position:absolute;margin-top:-1px; margin-left:-1px;width:${d.width}px;height:${d.height}px;border-radius:10px;border: 1px solid #E4E2E9">
               <div style="background-color:${color};position:absolute;margin-top:-25px;margin-left:${15}px;border-radius:100px;width:50px;height:50px;" ></div>
               <img src=" ${d.data.imageUrl }" style="position:absolute;margin-top:-20px;margin-left:${20}px;border-radius:100px;width:40px;height:40px;" />
              <div style="color:#08011E;position:absolute;right:20px;top:17px;font-size:10px;"><i class="fas fa-ellipsis-h"></i></div>
              <div style="font-size:15px;color:#08011E;margin-left:20px;margin-top:32px"> ${d.data.name} </div>
              <div style="color:#716E7B;margin-left:20px;margin-top:3px;font-size:10px;"> ${d.data.positionName} </div>
           </div>`;
           

           return template1;

          });

          chart.render();


        context.signalRenderComplete();
    }
});
