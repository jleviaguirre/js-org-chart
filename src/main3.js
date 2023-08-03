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


        // const data = d3.csvParse(demoData);
        console.log(demoData);


        const axes = await dataView.axes();
        const rows = await dataView.allRows();
        rows.forEach((row,i) => {
            console.log(i,  axes.map(axis => {
                if(axis.isCategorical){
                    return row.categorical(axis.name).formattedValue()
                }
                return row.continuous(axis.name).value()
            }).join(","));
        }); 


        let dataFlattened = d3.csvParse(demoData);

        var chart = new d3.OrgChart()
        .container('.chart-container')
        .data(dataFlattened)
        .nodeWidth((d) => 250)
        .initialZoom(0.7)
        .nodeHeight((d) => 175)
        .childrenMargin((d) => 40)
        .compactMarginBetween((d) => 15)
        .compactMarginPair((d) => 80)
        .nodeContent(function (d, i, arr, state) {

            const template1 = `
            <div style="padding-top:30px;background-color:none;margin-left:1px;height:${d.height}px;border-radius:2px;overflow:visible">
              <div style="height:${d.height - 32}px;padding-top:0px;background-color:white;border:1px solid lightgray;">
                <img src=" ${d.data.imageUrl}" style="margin-top:-30px;margin-left:${d.width / 2 - 30}px;border-radius:100px;width:60px;height:60px;" />
               <div style="margin-right:10px;margin-top:15px;float:right">${d.data.id}</div>
               <div style="margin-top:-30px;background-color:#3AB6E3;height:10px;width:${d.width - 2}px;border-radius:1px"></div>
               <div style="padding:20px; padding-top:35px;text-align:center">
                   <div style="color:#111672;font-size:16px;font-weight:bold"> ${d.data.name} </div>
                   <div style="color:#404040;font-size:16px;margin-top:4px"> ${d.data.positionName} </div>
               </div> 
               <div style="display:flex;justify-content:space-between;padding-left:15px;padding-right:15px;">
                 <div > Manages:  ${d.data._directSubordinates} 👤</div>  
                 <div > Oversees: ${d.data._totalSubordinates} 👤</div>    
               </div>
              </div>     
            </div>`;

           return template1;

          });

          chart.render();


        context.signalRenderComplete();
    }
});
