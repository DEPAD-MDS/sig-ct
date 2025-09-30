import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Simplified GeoJSON for Brazilian states (simplified for demonstration)
const brazilGeoJSON = {
  type: "FeatureCollection",
  features: [
    // Southeast
    { type: "Feature", id: "SP", properties: { name: "São Paulo", region: "Southeast" }, geometry: { type: "Polygon", coordinates: [[[-50.0, -22.0], [-47.0, -22.0], [-44.0, -24.0], [-46.0, -25.0], [-48.5, -25.0], [-50.0, -24.0], [-50.0, -22.0]]] }},
    { type: "Feature", id: "RJ", properties: { name: "Rio de Janeiro", region: "Southeast" }, geometry: { type: "Polygon", coordinates: [[[-44.0, -22.0], [-41.0, -22.0], [-41.0, -23.5], [-43.0, -23.5], [-44.0, -23.0], [-44.0, -22.0]]] }},
    { type: "Feature", id: "MG", properties: { name: "Minas Gerais", region: "Southeast" }, geometry: { type: "Polygon", coordinates: [[[-50.0, -15.0], [-46.0, -15.0], [-44.0, -17.0], [-43.0, -21.0], [-45.0, -22.5], [-48.0, -22.0], [-51.0, -20.0], [-51.0, -16.0], [-50.0, -15.0]]] }},
    { type: "Feature", id: "ES", properties: { name: "Espírito Santo", region: "Southeast" }, geometry: { type: "Polygon", coordinates: [[[-41.5, -18.5], [-40.0, -18.5], [-40.0, -21.0], [-41.5, -21.0], [-41.5, -18.5]]] }},
    
    // South
    { type: "Feature", id: "PR", properties: { name: "Paraná", region: "South" }, geometry: { type: "Polygon", coordinates: [[[-54.0, -23.0], [-52.0, -23.0], [-48.0, -25.0], [-48.5, -26.5], [-53.0, -26.5], [-54.5, -25.5], [-54.0, -23.0]]] }},
    { type: "Feature", id: "SC", properties: { name: "Santa Catarina", region: "South" }, geometry: { type: "Polygon", coordinates: [[[-53.5, -26.0], [-51.0, -26.0], [-48.5, -27.0], [-48.5, -29.0], [-50.0, -29.5], [-53.5, -28.5], [-53.5, -26.0]]] }},
    { type: "Feature", id: "RS", properties: { name: "Rio Grande do Sul", region: "South" }, geometry: { type: "Polygon", coordinates: [[[-57.0, -28.0], [-54.0, -28.0], [-50.0, -29.0], [-49.7, -30.5], [-50.5, -31.5], [-53.0, -33.0], [-54.0, -32.5], [-57.5, -30.5], [-57.0, -28.0]]] }},
    
    // Northeast
    { type: "Feature", id: "BA", properties: { name: "Bahia", region: "Northeast" }, geometry: { type: "Polygon", coordinates: [[[-46.0, -9.0], [-43.0, -9.0], [-38.0, -11.0], [-37.5, -15.0], [-39.0, -18.0], [-41.0, -18.0], [-43.0, -16.0], [-46.5, -13.0], [-46.0, -9.0]]] }},
    { type: "Feature", id: "PE", properties: { name: "Pernambuco", region: "Northeast" }, geometry: { type: "Polygon", coordinates: [[[-41.0, -7.5], [-39.0, -7.5], [-35.0, -8.0], [-35.0, -9.5], [-37.0, -9.5], [-41.0, -8.5], [-41.0, -7.5]]] }},
    { type: "Feature", id: "CE", properties: { name: "Ceará", region: "Northeast" }, geometry: { type: "Polygon", coordinates: [[[-41.5, -3.0], [-38.5, -3.0], [-37.0, -4.5], [-37.5, -7.5], [-40.5, -7.5], [-41.5, -5.5], [-41.5, -3.0]]] }},
    
    // North
    { type: "Feature", id: "AM", properties: { name: "Amazonas", region: "North" }, geometry: { type: "Polygon", coordinates: [[[-73.0, -2.0], [-68.0, -1.0], [-60.0, -1.5], [-56.5, -2.5], [-57.0, -7.0], [-63.0, -8.0], [-69.0, -8.5], [-73.0, -7.0], [-73.0, -2.0]]] }},
    { type: "Feature", id: "PA", properties: { name: "Pará", region: "North" }, geometry: { type: "Polygon", coordinates: [[[-59.0, -1.0], [-54.0, 2.5], [-48.0, -1.0], [-48.5, -6.0], [-52.0, -8.0], [-58.0, -7.0], [-59.0, -1.0]]] }},
    
    // Central-West
    { type: "Feature", id: "MT", properties: { name: "Mato Grosso", region: "Central-West" }, geometry: { type: "Polygon", coordinates: [[[-61.0, -7.5], [-58.0, -7.5], [-51.0, -10.0], [-51.0, -16.0], [-56.0, -18.0], [-61.0, -16.0], [-61.0, -7.5]]] }},
    { type: "Feature", id: "GO", properties: { name: "Goiás", region: "Central-West" }, geometry: { type: "Polygon", coordinates: [[[-53.0, -13.0], [-50.0, -13.0], [-46.5, -15.5], [-47.0, -19.0], [-51.0, -19.5], [-53.0, -17.0], [-53.0, -13.0]]] }},
    { type: "Feature", id: "DF", properties: { name: "Distrito Federal", region: "Central-West" }, geometry: { type: "Polygon", coordinates: [[[-48.2, -15.5], [-47.3, -15.5], [-47.3, -16.0], [-48.2, -16.0], [-48.2, -15.5]]] }},
    { type: "Feature", id: "MS", properties: { name: "Mato Grosso do Sul", region: "Central-West" }, geometry: { type: "Polygon", coordinates: [[[-58.0, -17.5], [-54.5, -17.5], [-51.0, -20.0], [-50.0, -22.5], [-53.0, -24.0], [-57.0, -23.0], [-58.0, -20.0], [-58.0, -17.5]]] }}
  ]
};

// Mock data generator
const generateMockData = () => {
  const states = ["SP", "RJ", "MG", "ES", "PR", "SC", "RS", "BA", "PE", "CE", "AM", "PA", "MT", "GO", "DF", "MS"];
  const cities = {
    SP: ["São Paulo", "Campinas", "Santos", "Ribeirão Preto", "Sorocaba"],
    RJ: ["Rio de Janeiro", "Niterói", "Duque de Caxias", "Nova Iguaçu"],
    MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora"],
    BA: ["Salvador", "Feira de Santana", "Vitória da Conquista"],
    PR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa"],
    SC: ["Florianópolis", "Joinville", "Blumenau", "Chapecó"],
    RS: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas"],
  };
  
  const data = [];
  states.forEach(state => {
    const numPoints = Math.floor(Math.random() * 15) + 5;
    for (let i = 0; i < numPoints; i++) {
      const stateCities = cities[state] || ["Capital"];
      data.push({
        id: `${state}-${i}`,
        state,
        city: stateCities[Math.floor(Math.random() * stateCities.length)],
        vagas: Math.floor(Math.random() * 500) + 10,
        lat: -15 + Math.random() * 20,
        lng: -55 + Math.random() * 15
      });
    }
  });
  return data;
};

export default function Geral() {
  const [viewMode, setViewMode] = useState<'points' | 'heatmap'>('points');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const [data] = useState(generateMockData());

  // Get available states and cities
  const states = Array.from(new Set(data.map(d => d.state))).sort();
  const cities = selectedState === 'all' 
    ? Array.from(new Set(data.map(d => d.city))).sort()
    : Array.from(new Set(data.filter(d => d.state === selectedState).map(d => d.city))).sort();

  // Filter and sort data
  const filteredData = data
    .filter(d => selectedState === 'all' || d.state === selectedState)
    .filter(d => selectedCity === 'all' || d.city === selectedCity)
    .sort((a, b) => sortOrder === 'desc' ? b.vagas - a.vagas : a.vagas - b.vagas);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    const g = svg.append('g');

    // Create projection for Brazil
    const projection = d3.geoMercator()
      .center([-52, -15])
      .scale(800)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Draw states
    const statesGroup = g.append('g').attr('class', 'states');
    
    statesGroup.selectAll('path')
      .data(brazilGeoJSON.features)
      .enter()
      .append('path')
      .attr('d', path as any)
      .attr('fill', (d: any) => {
        if (selectedState === 'all') {
          const stateData = filteredData.filter(item => item.state === d.id);
          const total = stateData.reduce((sum, item) => sum + item.vagas, 0);
          return total > 0 ? d3.interpolateBlues(Math.min(total / 2000, 1)) : '#1e293b';
        }
        return selectedState === d.id ? '#3b82f6' : '#1e293b';
      })
      .attr('stroke', (d: any) => hoveredState === d.id ? '#60a5fa' : '#475569')
      .attr('stroke-width', (d: any) => hoveredState === d.id ? 2 : 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d: any) {
        setHoveredState(d.id);
        d3.select(this)
          .attr('stroke', '#60a5fa')
          .attr('stroke-width', 2);
      })
      .on('mouseout', function(event, d: any) {
        setHoveredState(null);
        d3.select(this)
          .attr('stroke', selectedState === d.id ? '#60a5fa' : '#475569')
          .attr('stroke-width', selectedState === d.id ? 2 : 1);
      })
      .on('click', (event, d: any) => {
        setSelectedState(selectedState === d.id ? 'all' : d.id);
        setSelectedCity('all');
      });

    // Add state labels
    statesGroup.selectAll('text')
      .data(brazilGeoJSON.features)
      .enter()
      .append('text')
      .attr('transform', (d: any) => `translate(${path.centroid(d as any)})`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('pointer-events', 'none')
      .text((d: any) => d.id);

    // Visualize data points or heatmap
    if (viewMode === 'points') {
      const pointsGroup = g.append('g').attr('class', 'points');
      
      const maxVagas = d3.max(filteredData, d => d.vagas) || 1;
      const radiusScale = d3.scaleSqrt()
        .domain([0, maxVagas])
        .range([3, 15]);

      pointsGroup.selectAll('circle')
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('cx', d => projection([d.lng, d.lat])?.[0] || 0)
        .attr('cy', d => projection([d.lng, d.lat])?.[1] || 0)
        .attr('r', d => radiusScale(d.vagas))
        .attr('fill', '#ef4444')
        .attr('opacity', 0.6)
        .attr('stroke', '#dc2626')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .attr('opacity', 0.9)
            .attr('stroke-width', 2);
          
          // Tooltip
          const tooltip = g.append('g').attr('class', 'tooltip');
          const [x, y] = projection([d.lng, d.lat]) || [0, 0];
          
          tooltip.append('rect')
            .attr('x', x + 10)
            .attr('y', y - 40)
            .attr('width', 140)
            .attr('height', 60)
            .attr('fill', '#1e293b')
            .attr('stroke', '#475569')
            .attr('rx', 4);
          
          tooltip.append('text')
            .attr('x', x + 20)
            .attr('y', y - 20)
            .attr('fill', '#f1f5f9')
            .attr('font-size', '12px')
            .text(`${d.city}, ${d.state}`);
          
          tooltip.append('text')
            .attr('x', x + 20)
            .attr('y', y - 5)
            .attr('fill', '#94a3b8')
            .attr('font-size', '11px')
            .text(`Vagas: ${d.vagas}`);
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('opacity', 0.6)
            .attr('stroke-width', 1);
          g.selectAll('.tooltip').remove();
        });
    } else {
      // Heatmap visualization using contours
      const pointsGroup = g.append('g').attr('class', 'heatmap');
      
      // Create density data
      const densityData = filteredData.map(d => ({
        x: projection([d.lng, d.lat])?.[0] || 0,
        y: projection([d.lng, d.lat])?.[1] || 0,
        value: d.vagas
      }));

      // Simple heatmap using circles with gradient
      pointsGroup.selectAll('circle')
        .data(densityData)
        .enter()
        .append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 30)
        .attr('fill', d => d3.interpolateYlOrRd(d.value / 500))
        .attr('opacity', 0.4)
        .style('pointer-events', 'none');
    }

  }, [viewMode, selectedState, selectedCity, filteredData, hoveredState]);

  return (
    <section className="flex gap-6 flex-col p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-slate-100">Dashboard Geral</h1>
        
        {/* View mode toggle */}
        <div className="flex gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setViewMode('points')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'points' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pontos
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'heatmap' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mapa de Calor
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex flex-col gap-2 min-w-[180px]">
          <label className="text-sm font-medium text-slate-400">Estado</label>
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCity('all');
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Estados</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 min-w-[200px]">
          <label className="text-sm font-medium text-slate-400">Município</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={selectedState === 'all'}
          >
            <option value="all">Todos os Municípios</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 min-w-[200px]">
          <label className="text-sm font-medium text-slate-400">Ordenar Vagas</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Maior para Menor</option>
            <option value="asc">Menor para Maior</option>
          </select>
        </div>
      </div>

      {/* Map visualization */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="600"
          viewBox="0 0 800 600"
          style={{ background: '#0f172a' }}
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="text-sm font-medium text-slate-400">Card1</div>
          <div className="text-2xl font-semibold text-slate-100 mt-1">
            {filteredData.length}
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="text-sm font-medium text-slate-400">Total de Vagas</div>
          <div className="text-2xl font-semibold text-slate-100 mt-1">
            {filteredData.reduce((sum, d) => sum + d.vagas, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="text-sm font-medium text-slate-400">Total de vagas</div>
          <div className="text-2xl font-semibold text-slate-100 mt-1">
            {filteredData.length > 0 
              ? Math.round(filteredData.reduce((sum, d) => sum + d.vagas, 0) / filteredData.length)
              : 0}
          </div>
        </div>
      </div>
    </section>
  );
}