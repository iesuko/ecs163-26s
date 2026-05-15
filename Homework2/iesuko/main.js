d3.csv("global_terrorism.csv").then(data => {

    console.log("data loaded", data);

    data.forEach(d => {
        d.iyear = +d.iyear;
        d.nkill = +d.nkill;
        d.nwound = +d.nwound;

        d.nkill = isNaN(d.nkill) ? 0 : d.nkill;
        d.nwound = isNaN(d.nwound) ? 0 : d.nwound;

        d.total = d.nkill + d.nwound;
    });

    const filtered = data.filter(d => d.iyear >= 1970 && d.iyear <= 2020);

    const svg = d3.select("svg")
        .attr("width", window.innerWidth)
        .attr("height", 800);

     //plot 1: heatmap
     
    const margin = { top: 60, right: 30, bottom: 80, left: 150 };

    // processes data 
    const counts = d3.rollup(
        filtered,
        v => v.length,
        d => d.iyear,
        d => d.region_txt
    );

    const heatmapData = [];

    counts.forEach((regions, year) => {
        regions.forEach((count, region) => {
            heatmapData.push({ year, region, count });
        });
    });

    const width = 900;
    const height = 300;

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left + 10},${margin.top - 10})`);

    const years = [... new Set(heatmapData.map(d => d.year))].sort();
    const regions = [... new Set(heatmapData.map(d => d.region))].sort();

    const x = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.05);

    const y = d3.scaleBand()
        .domain(regions)
        .range([0, height])
        .padding(0.05);

    const color = d3.scaleSequential(d3.interpolateReds)
        .domain([0, d3.max(heatmapData, d => d.count)]);

    // creates the setup for the heatmap
    g.selectAll("rect")
        .data(heatmapData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.year)) // x-axis 
        .attr("y", d => y(d.region)) // y-axis 
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => color(d.count));

    g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickValues(years.filter(d => d % 5 === 0)))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    g. append("g")
        .call(d3.axisLeft(y));
    
    // x-axis label
     g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Year");

    // y-axis label
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -132)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Region");

    // heatmap title
    svg.append("text")
        .attr("x", 600)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .text("Terror Attacks by Year and By Region");
    
    // heatmap legend
    const defs = svg.append("defs");

    const gradient = defs.append("linearGradient")
        .attr("id", "heat-gradient");

    // creates a gradient for the legend using the same color as the heatmap chart 
    gradient.append("stop").attr("offset", "0%").attr("stop-color", d3.interpolateReds(0));
    gradient.append("stop").attr("offset", "100%").attr("stop-color", d3.interpolateReds(1));

    const legendScale = d3.scaleLinear()
        .domain(color.domain())
        .range([0, 350]);

    const legend = svg.append("g")
        .attr("transform", "translate(1070, 80)");
    
    legend.append("rect")
        .attr("width", 350)
        .attr("height", 10)
        .style("fill", "url(#heat-gradient)");
    
    legend.append("g")
        .attr("transform", "translate(0,10)")
        .call(d3.axisBottom(legendScale));

    // heatmap legend title
    legend.append("text")
        .attr("y", -5)
        .text("Number of Attacks");

    // plot 2: bar chart 
    const regionTotals = d3.rollup(
        filtered,
        v => v.length,
        d => d.region_txt
    );

    const barData = Array.from(regionTotals, ([region, count]) => ({
        region,
        count
    })).sort((a, b) => b.count - a.count);

    // positions chart 
    const gBar = svg.append("g")
        .attr("transform", "translate(150, 450)");
    
    // creates x-axis
    const xBar = d3.scaleBand()
        .domain(barData.map(d => d.region))
        .range([0, 400])
        .padding(0.2);
 
    // creates x-axis label
    gBar.append("text")
        .attr("x", 180)
        .attr("y", 310)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("Region")

    // creates y-axis 
    const yBar = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d.count)])
        .range([200, 0]);
   
    // creates y-axis label
    gBar.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -100)
        .attr("y", -70)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Number of Attacks")
    
    gBar.selectAll("rect")
        .data(barData)
        .enter()
        .append("rect")
        .attr("x", d => xBar(d.region))
        .attr("y", d => yBar(d.count))
        .attr("width", xBar.bandwidth())
        .attr("height", d => 200 - yBar(d.count))
        .attr("fill", "steelblue");

    gBar.append("g")
        .attr("transform", "translate(0,200)")
        .call(d3.axisBottom(xBar))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end");

    gBar.append("g")
        .call(d3.axisLeft(yBar));

    // barchart title 
    svg.append("text")
        .attr("x", 350)
        .attr("y", 430)
        .attr("text-anchor", "middle")
        .text("Total Terror Attacks By Region");

    // barchart legend
    const barLegend = svg.append("g")
        .attr("transform", "translate(440, 500)");

    barLegend.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "steelblue");

    // legend label
    barLegend.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .attr("font-size", "12px")
        .text("Total Attacks");

    // plot 3: parallel coordinates chart
    const pcData = filtered.map(d => ({
        iyear: d.iyear,
        nkill: d.nkill,
        nwound: d.nwound,
        total: d.total,
        region: d.region_txt
    }));

    const sample = pcData.slice(0, 1500);

    const dimensions = ["iyear", "nkill", "nwound", "total"];

    const pcWidth = 600;
    const pcHeight = 270;

    const g2 = svg.append("g")
        .attr("transform", `translate(680, 450)`);

    const xPC = d3.scalePoint()
        .domain(dimensions)
        .range([0, pcWidth]);

    const yPC = {};
    dimensions.forEach(dim => {
        yPC[dim] = d3.scaleLinear()
            .domain(d3.extent(sample, d => d[dim]))
            .range([pcHeight, 0]);
    });

    const regionList = [...new Set(sample.map(d => d.region))];

    const regionColor = d3.scaleOrdinal()
        .domain(regionList)
        .range(d3.schemeTableau10);

    function path(d) {
        return d3.line()(dimensions.map(p => [xPC(p), yPC[p](d[p])]));
    }

    g2.selectAll("path")
        .data(sample)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", d => regionColor(d.region))
        .attr("opacity", 0.25);

    dimensions.forEach(dim => {
        g2.append("g")
            .attr("transform", `translate(${xPC(dim)}, 0)`)
            .each(function () {
                d3.select(this).call(d3.axisLeft(yPC[dim]).ticks(5));
            })
            .append("text")
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .text(dim);
    });

    // changes the names of the variables for the axes 
    const newNames = {
        iyear: "Year",
        nkill: "Kills",
        nwound: "Wounds",
        total: "Total Impact"
    };

    // creates the axes on the parallel coordinates chart 
    dimensions.forEach(dim => {
        g2.append("text")
            .attr("x", xPC(dim))
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(newNames[dim]);
    });

    // parallel coordinates chart title 
    svg.append("text")
        .attr("x", 970)
        .attr("y", 425)
        .attr("text-anchor", "middle")
        .text("Terror Attack Casualties and Year by Region");

    // parallel coordinates legend
    const pcLegend = svg.append("g")
        .attr("transform", "translate(1300, 470)");

    regionList.forEach((region, i) => {
        const g = pcLegend.append("g")
            .attr("transform", `translate(0, ${i * 15})`);
        
        // picks colors and adds the regions as variables 
        g.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", regionColor(region));
        
        g.append("text")
            .attr("x", 15)
            .attr("y", 9)
            .text(region)
            .style("font-size", "9px");
    });

    // legend title 
    pcLegend.append("text")
        .attr("y", -10)
        .text("Region");
    
}).catch(error => {
    console.error("Error loading data:", error);
});
