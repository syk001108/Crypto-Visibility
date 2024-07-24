import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './NetworkTopology.css'; // Import CSS file

const NetworkTopology = ({ nodes, links }) => {
  const svgRef = useRef();
  const width = window.innerWidth; // Adjust as needed
  const height = window.innerHeight * 0.8; // Adjust as needed

  useEffect(() => {
    // Clear existing SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('class', 'network-topology-svg') // Assign a class for styling purposes
      .style('border', '1px solid gray'); // View box border

    const resize = () => {
      svg.attr('width', width)
         .attr('height', height)
         .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`);
    };

    // Initialize SVG dimensions
    resize();

    // Adjust SVG dimensions on window resize
    window.addEventListener('resize', resize);

    // Define clipping path
    svg.append('defs').append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('x', -width / 2)
      .attr('y', -height / 2)
      .attr('width', width)
      .attr('height', height);

    // Process each link in the provided 'links' array
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(200)) // Use links array directly
      .force('charge', d3.forceManyBody().strength(-80)) // Adjust node repulsion strength
      .force('center', d3.forceCenter(0, 0)) // Center simulation
      .on('tick', ticked);

    // Create markers for each link based on encryptionstatus
    links.forEach((link, index) => {
      const color = link.encryptionstatus === 1 ? '#d4a017' :
                    link.encryptionstatus === 2 ? 'red' : 'black';

      svg.append('defs').append('marker')
        .attr('id', `arrowhead-${index}`)
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 22)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('xoverflow', 'visible')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', color)
        .style('stroke','none');
    });

    const link = svg.append('g')
      .attr('class', 'links')
      .attr('clip-path', 'url(#clip)') // Apply clipping path
      .selectAll('path')
      .data(links) // Use links array directly
      .enter()
      .append('path')
      .attr('stroke-width', 4)
      .attr('stroke', d => {
        switch (d.encryptionstatus) {
          case 1:
            return '#d4a017'; // Dark yellow
          case 2:
            return 'red';
          default:
            return 'black';
        }
      })
      .attr('marker-end', (d, i) => `url(#arrowhead-${i})`) // Attach the corresponding arrowhead marker to the path
      .on('click', (event, d) => showPopup(event, d))
      .attr('d', d => `M ${d.srcip.x},${d.srcip.y} L ${d.dstip.x},${d.dstip.y}`);

    const node = svg.append('g')
      .attr('class', 'nodes')
      .attr('clip-path', 'url(#clip)') // Apply clipping path
      .selectAll('polygon') // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ polygon here
      .data(nodes)
      .enter()
      .append('polygon')
      .attr('points', hexagonPoints(25)) // Generate hexagon points
      .attr('fill', 'white')
      .attr('stroke-width', 2)
      .attr('stroke', d => {
        return d.name.substring(0, 3) === 'Pod' ? '#06368e' : 'gray'; // Set stroke color to blue if name starts with 'Pod'
      })
      // .attr('stroke', d => d.name.startsWith('Pod') ? '#06368e' : 'gray')
      .call(drag(simulation));

    const label = svg.append('g')
      .attr('class', 'labels')
      .attr('clip-path', 'url(#clip)') // Apply clipping path
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'black')
      .attr('x', d => d.x)
      .attr('y', d => d.y);

    function ticked() {
      link.attr('d', d => `M ${clamp(d.srcip.x)},${clamp(d.srcip.y)} L ${clamp(d.dstip.x)},${clamp(d.dstip.y)}`);

      node.attr('transform', d => `translate(${clamp(d.x)},${clamp(d.y)})`);

      label.attr('x', d => clamp(d.x))
           .attr('y', d => clamp(d.y));
    }

    function clamp(x) {
      return Math.max(-width / 2, Math.min(width / 2, x));
    }

    function drag(simulation) {
      return d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphadstip(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphadstip(0);
          d.fx = null;
          d.fy = null;
        });
    }

    function showPopup(event, d) {
      const centerX = (d.srcip.x + d.dstip.x) / 2;
      const centerY = (d.srcip.y + d.dstip.y) / 2;

      // Remove existing popups
      svg.selectAll('.popup').remove();

      // Data entries to display in popup with vulnerability colors
      const dataEntries = [
        { label: 'TLS Version', value: d.tlsversion, vulnerability: d.metadata[0] },
        { label: 'Key Exchange', value: d.keyexchange, vulnerability: d.metadata[1] },
        { label: 'Authentication', value: d.authentication, vulnerability: d.metadata[1] },
        { label: 'Bulk Encryption', value: d.bulkencryption, vulnerability: d.metadata[1] },
        { label: 'Hash', value: d.hash, vulnerability: d.metadata[1] },
        { label: 'Signature Algorithm (Cert)', value: d.certsignature, vulnerability: d.metadata[2] },
        { label: 'Elliptic Curve', value: d.curvename, vulnerability: d.metadata[3] },
        { label: 'Signature Algorithm (Server)', value: d.skesignature, vulnerability: d.metadata[4] }
      ];

      // Calculate maximum text width dynamically
      const maxTextLength = Math.max(...dataEntries.map(entry => `${entry.label}: ${entry.value}`.length));
      const popupWidth = maxTextLength * 7; // Adjust the multiplier as needed for padding
      const popupHeight = dataEntries.length * 20 + 30; // Adjust height based on content
      const popupPadding = 10; // Padding around popup
      const lineHeight = 20; // Line height for each entry

      // Create popup group
      const popup = svg.append('g')
        .attr('class', 'popup')
        .attr('transform', `translate(${centerX}, ${centerY})`);

      // Popup background
      popup.append('rect')
        .attr('class', 'popup-background')
        .attr('x', -popupWidth / 2)
        .attr('y', -popupHeight / 2)
        .attr('width', popupWidth)
        .attr('height', popupHeight);

      // Close button 'x'
      popup.append('text')
        .text('×')
        .attr('x', popupWidth / 2 - 10)
        .attr('y', -popupHeight / 2 + 10)
        .attr('font-size', 16)
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('cursor', 'pointer')
        .on('click', () => popup.remove());

      // Display data entries in popup with color coding based on vulnerability
      dataEntries.forEach((entry, index) => {
        popup.append('text')
          .text(`${entry.label}: ${entry.value}`)
          .attr('x', -popupWidth / 2 + popupPadding)
          .attr('y', -popupHeight / 2 + popupPadding + (index + 1) * lineHeight)
          .attr('font-size', 12)
          .attr('fill', () => {
            switch (entry.vulnerability) {
              case 0:
                return 'black';
              case 1:
                return '#d4a017'; // Dark yellow
              case 2:
                return 'red';
              default:
                return 'black';
            }
          });
      });
    }

    function hexagonPoints(size) {
      const angle = Math.PI / 3;
      return d3.range(0, 6).map(i => {
        const x = size * Math.cos(angle * i);
        const y = size * Math.sin(angle * i);
        return [x, y].join(',');
      }).join(' ');
    }

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [nodes, links, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default NetworkTopology;
