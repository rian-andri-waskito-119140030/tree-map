import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './App.css';

const datasets = {
  'video-game-sales': {
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json',
    title: 'Video Game Sales',
    description: 'Top 100 Most Sold Video Games Grouped by Platform'
  },
  'kickstarter-pledges': {
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json',
    title: 'Kickstarter Pledges',
    description: 'Top 100 Most Funded Kickstarter Campaigns Grouped by Category'
  },
  'movie-sales': {
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json',
    title: 'Movie Sales',
    description: 'Top 100 Highest Grossing Movies Grouped by Genre'
  }
};

const App = () => {
  const [data, setData] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState('video-game-sales');
  const svgRef = useRef();
  const legendRef = useRef();

  useEffect(() => {
    d3.json(datasets[selectedDataset].url).then(setData);
  }, [selectedDataset]);

  useEffect(() => {
    if (data) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove(); // Clear previous SVG elements
      const width = 960;
      const height = 570;

      const root = d3.hierarchy(data)
        .eachBefore(d => { d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name; })
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value);

      d3.treemap()
        .size([width, height])
        .paddingInner(1)(root);

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      const nodes = svg.selectAll('g')
        .data(root.leaves())
        .enter().append('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

      nodes.append('rect')
        .attr('class', 'tile')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .style('fill', d => color(d.data.category));

      nodes.append('text')
        .attr('x', 5)
        .attr('y', 20)
        .text(d => d.data.name);

      const tooltip = d3.select('#tooltip');

      nodes.on('mouseover', (event, d) => {
        tooltip.style('opacity', 1)
          .html(`Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`)
          .attr('data-value', d.data.value)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`);
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });

      const categories = root.leaves().map(nodes => nodes.data.category)
        .filter((v, i, a) => a.indexOf(v) === i);

      const legend = d3.select(legendRef.current);
      legend.selectAll('*').remove(); // Clear previous legend elements

      const legendItems = legend.selectAll('g')
        .data(categories)
        .enter().append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(${(i % 6) * 171.9}, ${Math.floor(i / 6) * 30})`); // Adjust for 3x6 grid

      legendItems.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 100)
        .attr('height', 20)
        .attr('class', 'legend-item')
        .style('fill', d => color(d));

      legendItems.append('text')
        .attr('x', 50)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .text(d => d);
    }
  }, [data]);

  const handleDatasetChange = (dataset) => {
    setSelectedDataset(dataset);
  };

  return (
    <div className="App">
      <div className="navbar">
        <button onClick={() => handleDatasetChange('video-game-sales')}>Video Game Data Set</button>
        <button onClick={() => handleDatasetChange('movie-sales')}>Movies Data Set</button>
        <button onClick={() => handleDatasetChange('kickstarter-pledges')}>Kickstarter Data Set</button>
      </div>
      <h1 id="title">{datasets[selectedDataset].title}</h1>
      <p id="description">{datasets[selectedDataset].description}</p>
      <svg ref={svgRef} width="960" height="570"></svg>
      <svg id="legend" ref={legendRef} width="960" height="90"></svg> {/* Adjust height for legend */}
      <div id="tooltip" style={{ position: 'absolute', opacity: 0 }}></div>
    </div>
  );
};

export default App;
