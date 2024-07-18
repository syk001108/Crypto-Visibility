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

    // Process each link in the provided 'links' array
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(200)) // Use links array directly
      .force('charge', d3.forceManyBody().strength(-80)) // Adjust node repulsion strength
      .force('center', d3.forceCenter(0, 0)) // Center simulation
      .on('tick', ticked);

    // Create markers for each link based on encryptionStatus
    links.forEach((link, index) => {
      const color = link.encryptionStatus === 'Insecure' ? '#d4a017' :
                    link.encryptionStatus === 'None' ? 'red' : 'black';

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
      .selectAll('path')
      .data(links) // Use links array directly
      .enter()
      .append('path')
      .attr('stroke-width', 4)
      .attr('stroke', d => {
        switch (d.encryptionStatus) {
          case 'Insecure':
            return '#d4a017'; // Dark yellow
          case 'None':
            return 'red';
          default:
            return 'black';
        }
      })
      .attr('marker-end', (d, i) => `url(#arrowhead-${i})`) // Attach the corresponding arrowhead marker to the path
      .on('click', (event, d) => showPopup(event, d))
      .attr('d', d => `M ${d.source.x},${d.source.y} L ${d.target.x},${d.target.y}`);

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 25) // Node size
      .attr('fill', 'white')
      .attr('stroke', 'gray')
      .call(drag(simulation));

    const label = svg.append('g')
      .attr('class', 'labels')
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
      link.attr('d', d => `M ${clamp(d.source.x)},${clamp(d.source.y)} L ${clamp(d.target.x)},${clamp(d.target.y)}`);

      node.attr('cx', d => clamp(d.x))
          .attr('cy', d => clamp(d.y));

      label.attr('x', d => clamp(d.x))
           .attr('y', d => clamp(d.y));
    }

    function clamp(x) {
      return Math.max(-width / 2, Math.min(width / 2, x));
    }

    function drag(simulation) {
      return d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });
    }

    function showPopup(event, d) {
      const centerX = (d.source.x + d.target.x) / 2;
      const centerY = (d.source.y + d.target.y) / 2;

      // Remove existing popups
      svg.selectAll('.popup').remove();

      // Data entries to display in popup with vulnerability colors
      const dataEntries = [
        { label: 'TLS Version', value: d.tlsVersion, vulnerability: d.metadata[0] },
        { label: 'Cipher Suite', value: d.cipherSuite, vulnerability: d.metadata[1] },
        { label: 'Signature Algorithm (Cert)', value: d.certSignatureAlgorithm, vulnerability: d.metadata[2] },
        { label: 'Elliptic Curve', value: d.ellipticCurve, vulnerability: d.metadata[3] },
        { label: 'Signature Algorithm (Server)', value: d.skeSignatureAlgorithm, vulnerability: d.metadata[4] }
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

    // Cleanup function
    return () => {
      simulation.stop();
      window.removeEventListener('resize', resize);
    };
  }, [nodes, links]);

  return <svg ref={svgRef}></svg>;
};

export default NetworkTopology;
