'use strict';
var D3Node = require('d3-node');
var d3 = require('d3');

module.exports.availability = (event, context, callback) => {

    console.log(event); // Contains incoming request data (e.g., query params, headers and more)

    var drawCanvas = function() {
        var width = 170,
            height = width,
            radius = Math.min(width, height) / 1.4,
            spacing = 0.09,
            minsPerMonth = 43200,
            minValue = 1 / minsPerMonth,
            bgColour = '#444',
            fgColour = 'white',
            availGreen = '#41a940',
            availAmber = '#ffbf00',
            availRed = '#f45151',
            valAvailability = "",
            valCritical = 0,
            valMajor = 0,
            valMinor = 0,
            valPlanned = 0,
            valTotal = 0,
            startAngle = 0,
            tau = 2 * Math.PI, // http://tauday.com/tau-manifesto
            svg, d3n; //-(0.5*Math.PI);

        var getAvailColour = function(availability) {
            if (availability >= 99.95)
                return availGreen;
            else if (availability >= 99.90)
                return availAmber;
            else return availRed;
        };

        var fields = function() {
            var now = new Date;
            return [
            {
                index: .6,
                text: "",
                value: 1,
                startColour: bgColour,
                endColour: bgColour
            }, {
                index: .5,
                text: "",
                value: 1,
                startColour: bgColour,
                endColour: bgColour
            }, {
                index: .4,
                text: "",
                value: 1,
                startColour: bgColour,
                endColour: bgColour
            }, {
                index: .3,
                text: "",
                value: 1,
                startColour: bgColour,
                endColour: bgColour
            },
            {
                index: .6,
                text: "Critical (#val mins)",
                value: valCritical,
                startColour: '#00FF00',
                endColour: '#FF0000'
            }, {
                index: .5,
                text: "Major (#val mins)",
                value: valMajor,
                startColour: '#00FF00',
                endColour: '#FFA600'
            }, {
                index: .4,
                text: "Minor (#val mins)",
                value: valMinor,
                startColour: '#00FF00',
                endColour: '#FCFC83'
            }, {
                index: .3,
                text: "Planned (#val mins)",
                value: valPlanned,
                startColour: '#00FF00',
                endColour: '#9999FF'
            }];
        };

        var scale = function(value) {
            return 1 - Math.max(minValue, value / minsPerMonth);
        };


        var initSVG = function() {
            if (event.critical !== undefined)
                valCritical = parseFloat(event.critical);

            if (event.major !== undefined)
                valMajor = parseFloat(event.major);

            if (event.minor !== undefined)
                valMinor = parseFloat(event.minor);

            if (event.planned !== undefined)
                valPlanned = parseFloat(event.planned);

            if (event.total !== undefined) {
                valTotal = parseFloat(event.total);
                minsPerMonth = valTotal;
            }

            if (event.bg !== undefined && event.bg.length <= 10)
                bgColour = event.bg;

            if (event.fg !== undefined && event.fg.length <= 10)
                fgColour = event.fg;


            var options = {
                svgStyles: '.polygons {stroke: #000;} ' +
                    '.arc-center { fill: none } ' +
                    '.main-style { background: #4d4f53; margin: 0; font-family: sans-serif; font-size: 16px; color: white; height: 170px; width: 170px; } ' +
                    '.arc-text { fill: black; font-size: 10px; } ',
                d3Module: d3
            };

            d3n = new D3Node(options);
            var colorScheme = d3.scaleOrdinal(d3.schemeCategory20);

            svg = d3n.createSVG()
                .attr('width', width)
                .attr('height', height)
                .attr("style", "background-color: " + bgColour)
                .attr("class", "main-style")
                .attr("version", "1.1")
                .attr("baseProfile", "full")
                .attr("xmlns:xlink", "http://www.w3.org/1999/xlink");

        };

        var drawText = function() {
            var valCustomerAvailability = (((valTotal - valCritical - valMajor - valMinor - valPlanned) / valTotal) * 100).toFixed(2);
            var valUnplannedAvailability = (((valTotal - valCritical - valMajor - valMinor) / valTotal) * 100).toFixed(2);

            var gText = svg.append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            gText.append("text")
                .attr("x", "0px")
                .attr("y", "-18px")
                .attr("width", "60px")
                .style("text-anchor", "middle")
                .style("fill", fgColour)
                .style("font-size", "9px")
                .attr("transform", "scale(1,1)")
                .text("exl. planned");

            gText.append("text")
                .attr("x", "0px")
                .attr("y", "-5px")
                .attr("width", "60px")
                .attr("class", "availability-unplanned")
                .style("text-anchor", "middle")
                .style("fill", fgColour)
                .style("font-size", "11px")
                .attr("transform", "scale(1,1.2)")
                .text("0.00%");

            gText.append("text")
                .attr("x", "0px")
                .attr("y", "8px")
                .attr("width", "60px")
                .style("text-anchor", "middle")
                .style("fill", fgColour)
                .style("font-size", "9px")
                .attr("transform", "scale(1,1)")
                .text("customer xp");

            gText.append("text")
                .attr("x", "0px")
                .attr("y", "17px")
                .attr("width", "60px")
                .attr("class", "availability-customerxp")
                .style("text-anchor", "middle")
                .style("fill", fgColour)
                .style("font-size", "12px")
                .attr("transform", "scale(1,1.4)")
                .text("0.00%");

            gText.select(".availability-customerxp")
                .text(valCustomerAvailability + "%")
                .style("fill", getAvailColour(valCustomerAvailability));

            gText.select(".availability-unplanned")
                .text(valUnplannedAvailability + "%")
                .style("fill", getAvailColour(valUnplannedAvailability));

            return svg;
        };

        var drawArcs = function() {
            var colour = function(value, startColour, endColour) {
                if (value < 0.9995)
                    return endColour;
                else
                    return startColour;
            }

            var arc = d3.arc()
                .innerRadius(function(d) {
                    console.log('Calculating arc', d, radius);
                    return d.data.index * d.radius;
                })
                .outerRadius(function(d) {
                    return (d.data.index + d.spacing) * d.radius;
                })
                .startAngle((tau / 360));

            var gArcs = svg.append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            // Draw the invisible textpath that the text attaches to
            var gArcDefs = gArcs.append("defs");

            var pathDef = gArcDefs.selectAll("path")
                .data(fields)
                .enter().append("path")
                .datum(function (d) {
                    var percentage = ((minsPerMonth - d.value) / minsPerMonth);

                    return {
                      data: d,
                      radius: radius, // global variables
                      spacing: 0, // sets the arc segment to 0 pixels thick
                      percentage: 1,
                      endAngle: tau
                    };
                })
                .attr("id", function(d, i) {
                    return "arc" + i;
                })
                .style("fill", "none")
                .attr("stroke-width", 0)
                .attr("class", "arc-center")
                .attr("d", function(d) { return arc(d) });


            var field = gArcs.selectAll("g")
                .data(fields)
                .enter().append("g");

            // This is the background and main arc
            field.append("path")
                .datum(function (d) {
                    var percentage = ((minsPerMonth - d.value) / minsPerMonth);

                    return {
                      data: d,
                      radius: radius, // global variables
                      spacing: spacing, // global variables
                      percentage: percentage,
                      endAngle: tau * percentage
                    };
                })
                .style("fill", function(d) {
                  return colour(d.percentage, d.data.startColour, d.data.endColour);
                })
                .attr("id", function(d, i) {
                    return "rarc" + i;
                })
                .attr("stroke-width", 1)
                .attr("stroke", bgColour)
                .attr("d", function(d) { return arc(d) });

            field.append("text")
                .attr("dy", "-0.1em")
                .attr("dx", ".25em")
              .append("textPath")
                .style("font-size", "10px")
                .attr("xlinkhref", function(d, i) {
                    return "#arc" + i;
                })
                .text(function(d) { return d.text.replace('#val', d.value); });

            // field.append("path")
            //     .attr("class", "arc-body");
            //

            //
            // field.append("text")
            //     .attr("dy", ".25em")
            //     .attr("dx", ".25em")
            //     .style("text-anchor", "start")
            //     .append("textPath")
            //     .attr("startOffset", "26%")
            //     .attr("style", "font-size: 10px")
            //     .attr("class", "arc-text")
            //     .attr("xlink:href", function(d, i) {
            //         return "#arc-center-" + i;
            //     });

            // field.each(function(d) {
            //         this._value = d.value;
            //     })
            //     .data(fields)
            //     .each(function(d) {
            //         d.previousValue = this._value;
            //     })
            //     .transition()
            //     .ease("elastic")
            //     .duration(0)
            //     .each(fieldTransition);

            return svg;
        };

        initSVG();
        drawText();
        drawArcs();

        // create output files
        return d3n;
    };

    try {

        var canvas = drawCanvas();
        var svg = canvas.svgString();
        svg = svg.replace(/xlinkhref/g, "xlink:href");
        svg = svg.replace(/textpath/g, "textPath");

        console.log('Sending SVG', svg);

        const response = {
            statusCode: 200,
            body: svg
        };
        return callback(null, response);
        // return callback(null, canvas.toBuffer().toString('base64'));

    } catch (errorMessage) {
        console.log(errorMessage);

        const response = {
            statusCode: 400,
            body: errorMessage
        };

        return callback(null, response);
    }

    // Use this code if you don't use the http event with the LAMBDA-PROXY integration
    // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
