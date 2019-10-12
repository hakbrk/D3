let svgWidth = 960;
let svgHeight = 500;

let margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

let width = svgHeight - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
 let svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
let chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Initial Params
let chosenXAxis = "poverty"
let chosenYAxis = "obesity";

// function used for updating x-scale upon click on x-axis label
function xScale(stateData, chosenXAxis) {
    let xLinearScale = d3.scaleLinear()
      .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
        d3.max(stateData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
    return xLinearScale;
}

// function used for updating y-scale upon click on y-axis label
function yscale(stateData, chosenYAxis) {
    let yLinearScale = d3.scaleLinear()
      .domain([d3.min(stateData, d => d[chosenYAxis]), //check here if yaxis does not work
        d3.max(stateData, d => d[chosenYAxis]) * 1.2
      ])
      .range([0, height]); //check here if y axis does not work
    return yLinearScale
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// function used for updating circles group with a transition to
// new circles when x is changed
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}

// function used for updating circles group with a transition to
// new circles when y is changed
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duratation(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    if(chosenXAxis === "poverty") {
        let labelx = "In Poverty %:";
    }
    else if (chosenXAxis === "age") {
        let labelx = "Age:";
    }
    else {
        let labelx = "Median Income: $"
    };
    if (chosenYAxis === "obesity") {
        let labely = "Obese %:";
    }
    else if (chosenYAxis === "smokes") {
        let labely = "% Smokers: ";
    }
    else {
        let labely = "% Lack Healthcare"
    };

    let tooltip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return(`${d.state}<br>${labelx} ${d[chosenXAxis]}<br>${labely} ${d[chosenYAxis]}`);
        });
    circlesGroup.call(tooltip);

    circlesGroup.on("mouseover", function(data) {
        tooltip.show(data);
    })

        .on("mouseout", function(data, index) {
            tooltip.hide(data);
        });
    return circlesGroup;
};

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function(stateData, err) {
    if (err) throw err;

    //parse data
    stateData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.obesity = +data.obesity;
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
    });

    // x and y linear scales
    let xLinearScale = xScale(stateData, chosenXAxis);
    let yLinearScale = yScale(stateData, chosenYAxis);

    // Create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        attr("trnsform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    // append y axis
    let yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .attr("transform", `translate(0, ${width})`)
        .call(leftAxis);

    // append initial circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("fill", "blue")
        .attr("opacity", ".5");

    // Create group for  3 x- axis labels
    let labelsxGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    let povertyLabel = labelsxGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty %");

    let ageLabel = labelsxGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (medium)");

    let incomeLabel = labelsxGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income");
    
    let labelsyGroup = chartGroup.append("text")
        .attr("transform", "rotate(-90)", `translate(${width + 10}, ${height / 2})`);

    let obeselabel = labelsyGroup.append("text")
        .attr("x", -20)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .classed("active", true)
        .text("Obese (%)");

    let smokeslabel = labelsyGroup.append("text")
        .attr("x", -40)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .classed("active", true)
        .text("Smokes (%)");

    let healthlabel = labelsyGroup.append("text")
        .attr("x", -60)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    // let circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    //labels x event listener
    labelsxGroup.selectAll("text")
        .on("click", function() {
            let value = d3.selct(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;
        
                // console.log(chosenXAxis)
        
                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(stateData, chosenXAxis);
        
                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);
        
                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        
                // changes classes to change bold text
                if (chosenXAxis === "age") {
                  ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                  povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else if (chosenXAxis === "poverty") {
                  ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                  incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else {
                  ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                  incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }
              }
        })
        labelsyGroup.selectAll("text")
        .on("click", function() {
            let value = d3.selct(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = value;
        
                // console.log(chosenXAxis)
        
                // functions here found above csv import
                // updates x scale for new data
                yLinearScale = yScale(stateData, chosenYAxis);
        
                // updates x axis with transition
                yAxis = renderAxes(yLinearScale, yAxis);
        
                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);
        
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        
                // changes classes to change bold text
                if (chosenYAxis === "obesity") {
                  obeselabel
                    .classed("active", true)
                    .classed("inactive", false);
                  smokeslabel
                    .classed("active", false)
                    .classed("inactive", true);
                  healthlabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                  obeselabel
                    .classed("active", false)
                    .classed("inactive", true);
                  smokeslabel
                    .classed("active", true)
                    .classed("inactive", false);
                  healthlabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else {
                  obeselabel
                    .classed("active", false)
                    .classed("inactive", true);
                  smokeslabel
                    .classed("active", false)
                    .classed("inactive", true);
                  healthlabel
                    .classed("active", true)
                    .classed("inactive", false);
                }
              }
        })
        }).catch(function(error) {
            console.log(error);
});


