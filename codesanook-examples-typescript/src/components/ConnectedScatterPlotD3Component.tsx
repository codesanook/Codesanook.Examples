// Credit https://wattenberger.com/blog/react-and-d3
/*
  Useful links:
  Most basic connected scatter plot https://www.d3-graph-gallery.com/graph/connectedscatter_basic.html
  https://embed.plnkr.co/wJDcZmkEzXaLVhuLZmcQ/
  scalePoint https://www.d3indepth.com/scales/#scalepoint
  Building shapes in d3.js https://www.d3-graph-gallery.com/graph/shape.html
  Making a Scatter Plot with D3.js video https://www.youtube.com/watch?v=M2s2jowLkUo
*/

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
const margin = { left: 50, right: 50, top: 40, bottom: 0 };
const width = 1400;
const height = 300;
const { data, years } = getData();

const y = d3.scaleLinear()
  .domain([0, d3.max(data)])
  .range([height, 0]) // invert for y value

const yAxis = d3.axisLeft(y)
  .tickSize(-width)

const x = d3.scalePoint()
  .domain(years)
  .range([0, width])

const xAxis = d3.axisBottom(x)
  .tickSize(-height);
//.tickFormat((d, i) => d.substring(2));

export default function ConnectedScatterPlotD3Component() {
  const ref = useRef();

  useEffect(() => {
    // https://www.d3indepth.com/v4/enterexit/
    const svg = d3.select(ref.current);
    var chartGroup = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    var line = d3.line<number>()
      .x((d, i) => x(years[i]))
      .y(d => y(d));

    chartGroup.selectAll('path')
      .data(data)
      .enter().append('path')
      .attr('fill', 'none')
      .attr('stroke', '#69b3a2')
      .attr('stroke-width', 1)
      .attr('d', line(data));

    chartGroup.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => x(years[i]))
      .attr('cy', d => y(d))
      .attr('r', 3)
      .attr('fill', '#69b3a2')

    // label for y axis
    const yAxisGroup = chartGroup
      .append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    yAxisGroup.selectAll('line')
      .attr('class', 'line-y')

    // https://stackoverflow.com/a/45287709/1872200
    // yAxisGroup.selectAll('.tick:first-of-type line').remove();

    // .style('stroke', '#ccc')
    // .style('fill', 'none')
    // .style('stroke-width', '1')
    // .style('stroke-dasharray', '2')
    //.style('display', 'none')
    // format line, path of axis
    // https://stackoverflow.com/a/41537652/1872200

    yAxisGroup
      .select('path')
      .style('stroke', '#ccc')
      .style('fill', 'none')
      .style('stroke-width', '1')
      .style('stroke-dasharray', '2')

    // label for x axis
    const xAxisGroup = chartGroup.append('g')
      .attr('class', 'axis x')// hidden class is for hidden tick
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    xAxisGroup
      .selectAll("text")
      .attr("transform", "rotate(315) translate(-10, 5)");

    xAxisGroup.selectAll('line')
      .style('stroke', '#ccc')
      .style('fill', 'none')
      .style('stroke-width', '1')
      .style('stroke-dasharray', '2')
      //.style('display', 'none');

    xAxisGroup
      .select('path')
      .style('display', 'none');


    // transform text with SVG attribute
    // http://www.d3noob.org/2014/02/attributes-in-d3js.html

    // text anchor https://www.geeksforgeeks.org/svg-text-anchor-attribute/
    // https://vanseodesign.com/web-design/svg-text-baseline-alignment/
    // group https://www.youtube.com/watch?v=K2w6KKHsExY

  }, []);// Render  when component loaded and dataset changes

  return <svg width='100%' height='100%' ref={ref} />;
};


function getData() {
  const years = [
    '2508',
    '2509',
    '2510',
    '2511',
    '2512',
    '2513',
    '2514',
    '2515',
    '2516',
    '2517',
    '2518',
    '2519',
    '2520',
    '2521',
    '2522',
    '2523',
    '2524',
    '2525',
    '2526',
    '2527',
    '2528',
    '2529',
    '2530',
    '2531',
    '2532',
    '2533',
    '2534',
    '2535',
    '2536',
    '2537',
    '2538',
    '2539',
    '2540',
    '2541',
    '2542',
    '2543',
    '2544',
    '2545',
    '2546',
    '2547',
    '2548',
    '2549',
    '2550',
    '2551',
    '2552',
    '2553',
    '2554',
    '2555',
    '2556',
    '2557',
    '2558',
    '2559',
    '2560',
    '2561',
    '2562',
    '2563',
    '2564',
    '2565',
  ];

  const data = [
    416,
    414,
    416,
    451,
    476,
    416,
    451,
    576,
    912,
    1497,
    1580,
    1379,
    1519,
    1982,
    3063,
    5660,
    4869,
    4239,
    4791,
    4233,
    4274,
    4708,
    5614,
    5644,
    5004,
    4916,
    4615,
    4375,
    4467,
    4745,
    4712,
    4792,
    4869,
    5748,
    5144,
    5426,
    5766,
    6355,
    7167,
    7844,
    8555,
    11068.41,
    11399.50,
    13795.64,
    15827.18,
    18392.64,
    22809.11,
    24581.48,
    20529.93,
    19488.17,
    18834.45,
    20874.50,
    20226.63,
    19447.28,
    20468.21,
    26195.06,
    27265.81,
    28764.55,
  ];

  return { data, years }

}
