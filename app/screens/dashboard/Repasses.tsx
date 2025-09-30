import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Filter, X } from 'lucide-react';

const Repasses = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedAnalyst, setSelectedAnalyst] = useState('TODOS');
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const situationChartRef = useRef(null);

  const analysts = ['TODOS', 'ALESSANDRA', 'IVONE', 'PATRÍCIA', 'ATILA', 'LUÍSA', 'RAYLAN', 'BRUNO', 'MARCELA', 'CLAUDIA', 'MARCELO', 'DEPAD', 'MÁRCIO', 'FRANCISCO', 'MARUCIA'];

  const lineData = [
    { month: 'maio', entrada: 27, formalizado: 5 },
    { month: 'junho', entrada: 15, formalizado: 14 },
    { month: 'julho', entrada: 19, formalizado: 13 },
    { month: 'agosto', entrada: 7, formalizado: 19 },
    { month: 'setembro', entrada: 27, formalizado: 22 },
    { month: 'outubro', entrada: 27, formalizado: 22 },
    { month: 'novembro', entrada: 26, formalizado: 29 },
    { month: 'dezembro', entrada: 15, formalizado: 30 }
  ];

  const statusData = [
    { status: 'FINALIZADO', value: 199 },
    { status: 'IMPEDIMENTO TÉCNICO', value: 17 }
  ];

  const situationData = [
    { status: 'CELEBRADO', value: 182 },
    { status: 'IMPEDIMENTO TÉCNICO', value: 17 }
  ];

  // Line Chart
  useEffect(() => {
    if (!lineChartRef.current) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 900 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    d3.select(lineChartRef.current).selectAll("*").remove();

    const svg = d3.select(lineChartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
      .domain(lineData.map(d => d.month))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 60])
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "11px");

    svg.append("g")
      .call(d3.axisLeft(y).ticks(6))
      .selectAll("text")
      .style("font-size", "11px");

    const lineEntrada = d3.line()
      .x(d => x(d.month))
      .y(d => y(d.entrada));

    const lineFormalizado = d3.line()
      .x(d => x(d.month))
      .y(d => y(d.formalizado));

    svg.append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", lineEntrada);

    svg.append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("d", lineFormalizado);

    lineData.forEach(d => {
      svg.append("circle")
        .attr("cx", x(d.month))
        .attr("cy", y(d.entrada))
        .attr("r", 3)
        .attr("fill", "#3b82f6");

      svg.append("text")
        .attr("x", x(d.month))
        .attr("y", y(d.entrada) - 8)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .text(d.entrada);

      svg.append("circle")
        .attr("cx", x(d.month))
        .attr("cy", y(d.formalizado))
        .attr("r", 3)
        .attr("fill", "#ef4444");

      svg.append("text")
        .attr("x", x(d.month))
        .attr("y", y(d.formalizado) - 8)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .text(d.formalizado);
    });
  }, []);

  // Status Bar Chart (Horizontal)
  useEffect(() => {
    if (!statusChartRef.current) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 150 };
    const width = 700 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    d3.select(statusChartRef.current).selectAll("*").remove();

    const svg = d3.select(statusChartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, 200])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(statusData.map(d => d.status))
      .range([0, height])
      .padding(0.3);

    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "12px");

    svg.selectAll("rect")
      .data(statusData)
      .enter()
      .append("rect")
      .attr("y", d => y(d.status))
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("width", d => x(d.value))
      .attr("fill", "#1e40af");

    svg.selectAll("text.value")
      .data(statusData)
      .enter()
      .append("text")
      .attr("class", "value")
      .attr("x", d => x(d.value) + 5)
      .attr("y", d => y(d.status) + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(d => d.value);
  }, []);

  // Situation Bar Chart (Vertical)
  useEffect(() => {
    if (!situationChartRef.current) return;

    const margin = { top: 20, right: 30, bottom: 80, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.select(situationChartRef.current).selectAll("*").remove();

    const svg = d3.select(situationChartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(situationData.map(d => d.status))
      .range([0, width])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, 200])
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-25)")
      .style("text-anchor", "end")
      .style("font-size", "11px");

    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "11px");

    svg.selectAll("rect")
      .data(situationData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.status))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", "#1e40af");

    svg.selectAll("text.value")
      .data(situationData)
      .enter()
      .append("text")
      .attr("class", "value")
      .attr("x", d => x(d.status) + x.bandwidth() / 2)
      .attr("y", d => y(d.value) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("font-weight", "bold")
      .text(d => d.value);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">CAFT - FORMALIZAÇÃO</h1>
            <p className="text-sm">PROPOSTAS DEPAD</p>
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2"
          >
            <Filter size={20} />
            FILTROS
          </button>
        </div>
      </div>

      {/* Filter Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-blue-900 text-white transition-transform duration-300 z-50 ${
          isFilterOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '280px' }}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">FILTROS</h2>
            <button onClick={() => setIsFilterOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Nº PROCESSO SEI</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-blue-800 rounded text-white"
                placeholder="Search"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Nº PRÉ-CONVÊNIO</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-blue-800 rounded text-white"
                placeholder="Search"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Nº PROPOSTA</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-blue-800 rounded text-white"
                placeholder="Search"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">ANALISTA RESPONSÁVEL</label>
              <div className="grid grid-cols-2 gap-2">
                {analysts.map((analyst) => (
                  <button
                    key={analyst}
                    onClick={() => setSelectedAnalyst(analyst)}
                    className={`px-3 py-2 rounded text-sm ${
                      selectedAnalyst === analyst
                        ? 'bg-blue-600'
                        : 'bg-blue-800 hover:bg-blue-700'
                    }`}
                  >
                    {analyst}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">DATA DE ENTRADA NO CAFT</label>
              <div className="flex gap-2">
                <input type="date" className="flex-1 px-3 py-2 bg-blue-800 rounded text-white" defaultValue="2024-05-09" />
                <input type="date" className="flex-1 px-3 py-2 bg-blue-800 rounded text-white" defaultValue="2024-12-24" />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">DATA DE FORMALIZAÇÃO</label>
              <div className="flex gap-2">
                <input type="date" className="flex-1 px-3 py-2 bg-blue-800 rounded text-white" defaultValue="2024-07-30" />
                <input type="date" className="flex-1 px-3 py-2 bg-blue-800 rounded text-white" defaultValue="2024-12-18" />
              </div>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded mt-4">
              🔄 LIMPAR FILTROS
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-900 text-white p-4 rounded">
            <div className="text-sm">INDICAÇÃO (TOTAL)</div>
            <div className="text-2xl font-bold">R$ 52.705.262</div>
          </div>
          <div className="bg-blue-900 text-white p-4 rounded">
            <div className="text-sm">PROCESSOS SEI</div>
            <div className="text-2xl font-bold">199</div>
          </div>
          <div className="bg-blue-900 text-white p-4 rounded">
            <div className="text-sm">REPRESENTAÇÃO</div>
            <div className="text-2xl font-bold">100%</div>
          </div>
          <div className="bg-blue-900 text-white p-4 rounded">
            <div className="text-sm">CONTRAPARTIDA</div>
            <div className="text-2xl font-bold">R$ 259.829</div>
          </div>
          <div className="bg-blue-900 text-white p-4 rounded">
            <div className="text-sm">MÉDIA EM DIAS - ELABORAÇÃO</div>
            <div className="text-2xl font-bold">3</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-900 text-white p-4 rounded">
            <div className="text-sm">MÉDIA EM DIAS - FORMALIZAÇÃO</div>
            <div className="text-2xl font-bold">124</div>
          </div>
          <div className="bg-blue-900 text-white p-4 rounded">
            <div className="text-sm">VALOR GND 3</div>
            <div className="text-2xl font-bold">R$ 34.951.896</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-center font-semibold mb-4">Entrada na CAFT • Formalizados</h3>
            <div ref={lineChartRef}></div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Entrada na CAFT</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">Formalizados</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-center font-semibold mb-4">STATUS DOS PROCESSOS (CONSOLIDADOS)</h3>
            <div ref={statusChartRef}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-center font-semibold mb-4">SITUAÇÃO</h3>
          <div ref={situationChartRef}></div>
        </div>
      </div>
    </div>
  );
};

export default Repasses;