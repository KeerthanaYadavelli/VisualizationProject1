//variables and colors for labels
var ageColors = ['#4f772d', '#3dccc7', '#7b6888', '#03045e', '#e78f8e', '#ba2d0b'];
var ageLabel = ['0-10 (0)', '11-20 (1)', '21-40 (2)', '41-60 (3)', '61-80 (4)', '>80 (5)'];
var genderLabel = ['Male (0)', 'Female (1)', 'Pump', 'Brewery', 'Workhouse'];
var genderColors = ["#203b86", "#ef476f", "#3e0303", "#e2c32a", "#dd5c20"];
var x, y;
var margin = {
		top: 20,
		right: 20,
		bottom: 50,
		left: 70
	},
	width = 600 - margin.left - margin.right,
	height = 400 - margin.top - margin.bottom;
//variables for data
var pumps, deathsAgeSex, streets, deathsAge, deathdays, agesBar, genderPie, brewery, workhouse;
//chart for multi use
var mChart
//variables for tooltips
var timeTip, pieTip, mapTip, genderPieTip;
var zoom = d3.behavior.zoom()
	.scaleExtent([1, 10])
	.on("zoom", zoomed);
var drag = d3.behavior.drag()
	.origin(function (d) {
		return d;
	})
	.on("dragstart", dragstarted)
	.on("drag", dragged)
	.on("dragend", dragended);
window.onload = function () {
	//set click events
	document.getElementById('byAge').onclick = () => {
		d3.selectAll("circle").remove();
		drawItemsToMap();
		var xScale = d3.scale.linear();
		var yScale = d3.scale.linear();
		xScale.domain([0, 15]).range([0, 500]);
		yScale.domain([15, 0]).range([0, 500]);
		mChart.selectAll("circle")
			.data(deathsAgeSex)
			.enter().append("circle")
			.attr("cy", function (d) {
				return yScale(d.y);
			})
			.attr("cx", function (d) {
				return xScale(d.x);
			})
			.attr("r", 5)
			.style("fill", function (d) {
				return ageColors[d.age];
			})
			.call(mapTip)
			.on('mouseover', mapTip.show)
			.on('mouseout', mapTip.hide);
	};
	document.getElementById('byGender').onclick = () => {
		d3.selectAll("circle").remove();
		drawItemsToMap();
		var xScale = d3.scale.linear();
		var yScale = d3.scale.linear();
		xScale.domain([0, 15]).range([0, 500]);
		yScale.domain([15, 0]).range([0, 500]);
		mChart.selectAll("circle")
			.data(deathsAgeSex)
			.enter().append("circle")
			.attr("cy", function (d) {
				return yScale(d.y);
			})
			.attr("cx", function (d) {
				return xScale(d.x);
			})
			.attr("r", 5)
			.style("fill", function (d) {
				return genderColors[d.gender];
			})
			.call(mapTip)
			.on('mouseover', mapTip.show)
			.on('mouseout', mapTip.hide);
	}
	document.getElementById('zoomIn').onclick = () => {
		zoomClick('forward');
	}
	document.getElementById('zoomOut').onclick = () => {
		zoomClick('backward');
	}
	//get data at first from all our csv / json files.
	d3.csv("pumps.csv", function (list) {
		pumps = list;
		d3.csv("deaths_age_sex.csv", function (error, list) {
			deathsAgeSex = list;
			d3.csv("deathdays.csv", function (error, list) {
				deathdays = list;
				d3.json("streets.json", function (error, list) {
					streets = list;
					d3.csv("brewery.csv", function (error, list) {
						brewery = list;
						d3.csv("workhouse.csv", function (error, list) {
							workhouse = list;
							d3.json("barData.json", function (error, list) {
								agesBar = list;
								d3.json("genderData.json", function (error, list) {
									genderPie = list;
									createToolTips();
									createPieChart();
									createGenderPieChart();
									createMapChart();
									createTimeChart();
									document.getElementById('byAge').click();
									createMapDetails();
								});
							});
						});
					});
				});
			});
		});
	});
}

function createToolTips() {
	timeTip = d3.tip()
		.attr('class', 'toolTip')
		.offset([-10, 0])
		.html(function (d) {
			return `<p style="font-size: 12px"><strong>Day: </strong><span style='color:#43568d'>${d.date}</span></p>
					<p style="font-size: 12px"><strong>Deaths: </strong> <span style='color:#438d8d'>${d.deaths}</span></p>`;
		});

	pieTip = d3.tip()
		.attr('class', 'toolTip')
		.offset([-10, 0])
		.html(function (d) {
			return `<p style="font-size: 12px"><strong>Age Group: </strong><span style='color:#438d8d'>${d.data.age} (${d.data.ageGroup})</span></p>
					<p style="font-size: 12px"><strong>Total Deaths: </strong><span style='color:#438d8d'>${d.data.totalDeaths}</span></p>
					<p style="font-size: 12px"><strong>Deaths Percentage: </strong><span style='color:#438d8d'>${d.data.deathsPercent}%</span></p>`;
		})

	mapTip = d3.tip()
		.attr('class', 'toolTip')
		.offset([-10, 0])
		.html(function (d) {
			return `<p style="font-size: 12px"><strong>Age Group: </strong><span style='color:#438d8d'>${d.age} (${+d.age === 0 ? '0-10' : +d.age === 1 ? '11-20' : +d.age === 2 ? '21-40' : +d.age === 3 ? '41-60' : +d.age === 4 ? '61-80' : '>80'})</span></p>
					<p style="font-size: 12px"><strong>Gender: </strong><span style='color:#438d8d'>${+d.gender === 0 ? 'Male (0)' : 'Female (1)'}</span></p>`;
		})

	genderPieTip = d3.tip()
		.attr('class', 'toolTip')
		.offset([-10, 0])
		.html(function (d) {
			return `<p style="font-size: 12px"><strong>Gender: </strong><span style='color:#438d8d'>${d.data.label} (${d.data.gender})</span></p>
					<p style="font-size: 12px"><strong>Total Deaths: </strong><span style='color:#438d8d'>${d.data.totalDeaths}</span></p>
					<p style="font-size: 12px"><strong>Deaths Percentage: </strong><span style='color:#438d8d'>${d.data.deathsPercent}%</span></p>`;
		})
}

//draw timeline graph
function createTimeChart() {
	var svg = d3.select("#time_chart")
		.append("svg")
		.attr("id", "timeline")
		.attr("width", "600")
		.attr("height", "750")
		.append("g")
		.attr("transform", "translate(50,350)");

	var width = 600 - margin.left - margin.right,
		height = 700 - margin.top - margin.bottom;

	var svg = d3.select('#timeline').append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	var xscale = d3.scale.linear()
		.domain([0, 250])
		.range([0, 775]);
	var x = d3.scale.linear()
		.range([0, 25])
		.domain([0, d3.max(deathdays, function (d) {
			return d.deaths;
		})]);
	var grid = d3.range(26).map(function (i) {
		return {
			'x1': 0,
			'y1': 0,
			'x2': 0,
			'y2': 480
		};
	});
	var y = d3.scale.ordinal()
		.rangeRoundBands([height, 0], .1)
		.domain(deathdays.map(function (d) {
			return d.date;
		}));
	var values = [0, 0, 0, 5, 10, 10, 10, 20, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 120, 130, 140, 140, 140, 140, 150];
	var tickVals = grid.map(function (d, i) {
		/*if (i > 0) {*/
		return values[i];
		/*        } else if (i === 0) {
		            return "100";
		        }*/
	});
	//make y axis to show bar names
	var xAxis = d3.svg.axis();
	xAxis
		.orient('bottom')
		.scale(xscale)
		.tickValues(tickVals);
	var yAxis = d3.svg.axis()
		.scale(y)
		//no tick marks
		.tickSize(0)
		.orient("left");
	var gy = svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
	svg.append("g")
		.attr("transform", "translate(0,620)")
		.attr('id', 'xaxis')
		.call(xAxis);
	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - margin.left - 5)
		.attr("x", 0 - (height / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Date");
	svg.append("text")
		.attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 15) + ")")
		.style("text-anchor", "middle")
		.text("Number of Deaths")
	var bars = svg.selectAll(".bar")
		.data(deathdays)
		.enter()
		.append("g")

	//append rects
	bars.append("rect")
		.attr("class", "bar")
		.attr("y", function (d) {
			return y(d.date);
		})
		.attr("height", y.rangeBand())
		.attr("x", 0)
		.attr("width", function (d) {
			return x(d.deaths);
		})
		.call(timeTip)
		.on('mouseover', onChangeHover)
		.on('mouseout', timeTip.hide);

	//add a value label to the right of each bar
	bars.append("text")
		.attr("class", "label")
		//y position of the label is halfway down the bar
		.attr("y", function (d) {
			return y(d.date) + y.rangeBand() / 2 + 4;
		})
		//x position is 3 pixels to the right of the bar
		.attr("x", function (d) {
			return x(d.deaths) + 3;
		})
		.text(function (d) {
			return d.deaths;
		});
}

//draw map
function createMapChart() {
	mChart = d3.select("#map_chart")
		.append("svg")
		.attr("id", "main")
		.attr("width", "700")
		.attr("height", "700")
		.call(zoom)
		.append("g")
		.attr('id', 'svgZoom')
		.attr("transform", "translate(-50,150) ");

	// create d3 scale
	var xScale = d3.scale.linear();
	var yScale = d3.scale.linear();

	xScale.domain([0, 15]).range([0, 500]);
	yScale.domain([15, 0]).range([0, 500]);

	// define path generator
	let genPath = d3.svg.line()
		.x(function (d) {
			return xScale(d.x);
		})
		.y(function (d) {
			return yScale(d.y);
		});
	mChart.selectAll(".line")
		.data(streets)
		.enter().append("path")
		.style('fill', 'none')
		.style('stroke', 'black')
		.style('stroke-width', '2px')
		.attr("class", "map")
		.attr("d", genPath)
	mChart.append("text")
		.style("fill", "black")
		.style("font-size", "16px")
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.attr("transform", "translate(360,90) rotate(-36)")
		.text("Broad Street");
	mChart.append("text")
		.style("fill", "black")
		.style("font-size", "16px")
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.attr("transform", "translate(510,-20) rotate(67)")
		.text("Dean Street");
	mChart.append("text")
		.style("fill", "black")
		.style("font-size", "16px")
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.attr("transform", "translate(300,-55) rotate(-10)")
		.text("Oxford Street");
	mChart.append("text")
		.style("fill", "black")
		.style("font-size", "16px")
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.attr("transform", "translate(250,150) rotate(60)")
		.text("Regent Street");
}

//draw pie chart with Age Group
function createPieChart() {
	var width = 500,
		height = 300,
		radius = 350,
		numTicks = 5,
		sdat = [];

	var color = d3.scale.ordinal()
		.range(["#4f772d", "#3dccc7", "#7b6888", "#03045e", "#e78f8e", "#ba2d0b"]);

	var arc = d3.svg.arc()
		.outerRadius(function (d) {
			return 50 + (radius - 50) * d.data.percent / 100;
		})
		.innerRadius(20);

	var pie = d3.layout.pie()
		.sort(null)
		.value(function (d) {
			return d.percent;
		});

	var grid = d3.svg.area.radial()
		.radius(300);

	var svg = d3.select("#pie_chart").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	for (i = 0; i <= numTicks; i++) {
		sdat[i] = 20 + ((radius / numTicks) * i);
	}

	agesBar.forEach(function (d) {
		d.percent = d.deathsPercent;
	});

	var g = svg.selectAll(".arc")
		.data(pie(agesBar))
		.enter().append("g")
		.attr("class", "arc")
		.call(pieTip)
		.on('mouseover', refreshMapDataByPie)
		.on('mouseout', pieTip.hide);

	g.append("path")
		.attr("d", arc)
		.style("fill", function (d) {
			return color(d.data.age);
		});

	g.append("text")
		.attr("transform", function (d) {
			return "translate(" + arc.centroid(d) + ")";
		})
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.text(function (d) {
			return d.data.percent;
		});
}

//draw pie chart with Gender
function createGenderPieChart() {
	var width = 300,
		height = 200,
		radius = 100,
		numTicks = 5,
		sdat = [];

	var color = d3.scale.ordinal()
		.range(["#203b86", "#ef476f"]);

	var arc = d3.svg.arc()
		.outerRadius(function (d) {
			return 50 + (radius - 50) * d.data.percent / 100;
		})
		.innerRadius(20);

	var pie = d3.layout.pie()
		.sort(null)
		.value(function (d) {
			return d.percent;
		});

	var grid = d3.svg.area.radial()
		.radius(100);

	var svg = d3.select("#pie_gender_chart").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	for (i = 0; i <= numTicks; i++) {
		sdat[i] = 20 + ((radius / numTicks) * i);
	}

	genderPie.forEach(function (d) {
		d.percent = d.deathsPercent;
	});

	var g = svg.selectAll(".arc")
		.data(pie(genderPie))
		.enter().append("g")
		.attr("class", "arc")
		.call(genderPieTip)
		.on('mouseover', refreshMapDataByGenderPie)
		.on('mouseout', genderPieTip.hide);

	g.append("path")
		.attr("d", arc)
		.style("fill", function (d) {
			return color(d.data.label);
		});

	g.append("text")
		.attr("transform", function (d) {
			return "translate(" + arc.centroid(d) + ")";
		})
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.text(function (d) {
			return d.data.percent;
		});
}

//draw pumps, brewery, and workhouse
function drawItemsToMap() {
	var xScale = d3.scale.linear();
	var yScale = d3.scale.linear();
	xScale.domain([0, 15]).range([0, 450]);
	yScale.domain([15, 0]).range([0, 450]);
	pumpsChart = d3.select('#main').select('g').selectAll(".circle_p").data(pumps);

	pumpsChart.enter().append("circle")
		.attr("r", 15)
		.style("fill", "#3e0303");

	pumpsChart
		.attr("cx", function (d) {
			return xScale(d.x);
		})
		.attr("cy", function (d) {
			return yScale(d.y);
		});

	var breweryChart = d3.select('#main').select('g').selectAll(".circle_p").data(brewery);

	breweryChart.enter().append("circle")
		.attr("r", 15)
		.style("fill", "#e2c32a");

	breweryChart
		.attr("cx", function (d) {
			return xScale(d.x);
		})
		.attr("cy", function (d) {
			return yScale(d.y);
		});

	var workhouseChart = d3.select('#main').select('g').selectAll(".circle_p").data(workhouse);

	workhouseChart.enter().append("circle")
		.attr("r", 15)
		.style("fill", "#dd5c20");

	workhouseChart
		.attr("cx", function (d) {
			return xScale(d.x);
		})
		.attr("cy", function (d) {
			return yScale(d.y);
		});
}

/* update data functions */
function onChangeHover(data) {
	const d = deathsAgeSex.slice(0, data.deaths);
	refreshAgeDeathData(d);
	timeTip.show(data);
}

//draw death data based on Gender
function refreshGenderDeathData(data) {
	d3.selectAll("circle").remove();
	drawItemsToMap();
	var xScale = d3.scale.linear();
	var yScale = d3.scale.linear();
	xScale.domain([0, 15]).range([0, 500]);
	yScale.domain([15, 0]).range([0, 500]);
	var circles = d3.select('#main').select('g').selectAll(".circle_d").data(data);
	circles.enter().append("circle")
		.attr("r", 5)
		.style("fill", function (d) {
			return genderColors[d.gender];
		})
	circles
		.attr("cx", function (d) {
			return xScale(d.x);
		})
		.attr("cy", function (d) {
			return yScale(d.y);
		})

	if (data.length) {
		circles.call(mapTip)
			.on('mouseover', mapTip.show)
			.on('mouseout', mapTip.hide);
	}
	circles.exit().remove();
}

//draw death data based on Gender
function refreshAgeDeathData(data) {
	d3.selectAll("circle").remove();
	drawItemsToMap();
	var xScale = d3.scale.linear();
	var yScale = d3.scale.linear();
	xScale.domain([0, 15]).range([0, 500]);
	yScale.domain([15, 0]).range([0, 500]);
	var circles = d3.select('#main').select('g').selectAll(".circle_d").data(data);
	circles.enter().append("circle")
		.attr("r", 5)
		.style("fill", function (d) {
			return ageColors[d.age];
		})
	circles
		.attr("cx", function (d) {
			return xScale(d.x);
		})
		.attr("cy", function (d) {
			return yScale(d.y);
		})

	if (data.length) {
		circles.call(mapTip)
			.on('mouseover', mapTip.show)
			.on('mouseout', mapTip.hide);
	}
	circles.exit().remove();
}

function createMapDetails() {
	let data = '';
	ageColors.forEach((color, i) => {
		const template = `<div style="background-color: ${color}"  class="miniLine">
                      <p>${ageLabel[i]}</p>
                    </div>`;
		data += template;
	});
	genderColors.forEach((color, i) => {
		const template = `<div style="background-color: ${color}"  class="miniLine">
                      <p>${genderLabel[i]}</p>
                    </div>`;
		data += template;
	})
	document.getElementById('icons_map').innerHTML = data.trim();
}

function zoomed() {
	mapChart.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function dragstarted(d) {
	d3.event.sourceEvent.stopPropagation();
	d3.select(this).classed("dragging", true);
}

function dragged(d) {
	d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
	d3.select(this).classed("dragging", false);
}

function zoomed() {
	mChart.attr("transform",
		"translate(" + zoom.translate() + ")" +
		"scale(" + zoom.scale() + ")"
	);
}

function interpolateZoom(translate, scale) {
	var self = this;
	return d3.transition().duration(350).tween("zoom", function () {
		var iTranslate = d3.interpolate(zoom.translate(), translate),
			iScale = d3.interpolate(zoom.scale(), scale);
		return function (t) {
			zoom
				.scale(iScale(t))
				.translate(iTranslate(t));
			zoomed();
		};
	});
}

function zoomClick(zoomDirection) {
	var direction = 1,
		factor = 0.2,
		target_zoom = 1,
		center = [width / 2 + 200, height / 2 - 100],
		extent = zoom.scaleExtent(),
		translate = zoom.translate(),
		translate0 = [],
		l = [],
		view = {
			x: translate[0],
			y: translate[1],
			k: zoom.scale()
		};
	direction = zoomDirection === 'forward' ? 1 : -1;
	target_zoom = zoom.scale() * (1 + factor * direction);

	if (target_zoom < extent[0] || target_zoom > extent[1]) {
		return false;
	}

	translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
	view.k = target_zoom;
	l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

	view.x += center[0] - l[0];
	view.y += center[1] - l[1];

	interpolateZoom([view.x, view.y], view.k);
}

//to refresh the map based on hovered / selected Age Group pie slice
function refreshMapDataByPie(d) {
	console.log(d.data.ageGroup);
	var ageGroup = d.data.ageGroup;
	if (ageGroup == 0) {
		filteredData = deathsAgeSex.filter(function (d) {
			return d.age == 0
		});
	} else if (ageGroup == 1) {
		filteredData = deathsAgeSex.filter(function (d) {
			return d.age == 1
		});
	} else if (ageGroup == 2) {
		filteredData = deathsAgeSex.filter(function (d) {
			return d.age == 2
		});
	} else if (ageGroup == 3) {
		filteredData = deathsAgeSex.filter(function (d) {
			return d.age == 3
		});
	} else if (ageGroup == 4) {
		filteredData = deathsAgeSex.filter(function (d) {
			return d.age == 4
		});
	} else if (ageGroup == 5) {
		filteredData = deathsAgeSex.filter(function (d) {
			return d.age == 5
		});
	}
	pieTip.show(d);
	refreshAgeDeathData(filteredData);
}

//to refresh the map based on hovered / selected Gender pie slice
function refreshMapDataByGenderPie(d) {
	console.log(d.data.gender);
	var gender = d.data.gender;
	var filteredData;
	if (gender == 0) {
		filteredData = deathsAgeSex.filter(function (d) {
			return d.gender == 0
		});
	} else if (gender == 1) {
		filteredData = deathsAgeSex.filter(function (d) {
			return d.gender == 1
		});
	}
	genderPieTip.show(d);
	refreshGenderDeathData(filteredData);
}