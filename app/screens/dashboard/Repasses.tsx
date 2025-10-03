import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface TecnicoData {
  responsavel: string;
  gnd3: string;
  gnd4: string;
  tmFormalizacao: string;
  tmParecer: string;
}

interface StatusData {
  responsavel: string;
  finalizado: string;
  total: string;
}

interface ConcluidoData {
  responsavel: string;
  finalizado: string;
  total: string;
}

export default function Repasses() {
  const statusChartRef = useRef<SVGSVGElement>(null);
  const situacaoChartRef = useRef<SVGSVGElement>(null);

  // Mock data para as tabelas
  const demandaPorTecnico: TecnicoData[] = [
    { responsavel: "João Silva", gnd3: "25", gnd4: "18", tmFormalizacao: "12", tmParecer: "8" },
    { responsavel: "Maria Santos", gnd3: "32", gnd4: "22", tmFormalizacao: "10", tmParecer: "7" },
    { responsavel: "Pedro Costa", gnd3: "28", gnd4: "15", tmFormalizacao: "14", tmParecer: "9" },
    { responsavel: "Ana Oliveira", gnd3: "20", gnd4: "12", tmFormalizacao: "11", tmParecer: "6" },
  ];

  const statusPorAnalista: StatusData[] = [
    { responsavel: "João Silva", finalizado: "35", total: "43" },
    { responsavel: "Maria Santos", finalizado: "48", total: "54" },
    { responsavel: "Pedro Costa", finalizado: "38", total: "43" },
    { responsavel: "Ana Oliveira", finalizado: "28", total: "32" },
  ];

  const concluidosPorAnalista: ConcluidoData[] = [
    { responsavel: "João Silva", finalizado: "35", total: "35" },
    { responsavel: "Maria Santos", finalizado: "48", total: "48" },
    { responsavel: "Pedro Costa", finalizado: "38", total: "38" },
    { responsavel: "Ana Oliveira", finalizado: "28", total: "28" },
  ];

  // Gráfico de Status dos Processos (Consolidados)
  useEffect(() => {
    if (!statusChartRef.current) return;

    const svg = d3.select(statusChartRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 300;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };

    const data = [{ label: 'Finalizado', value: 199 }];

    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.4);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: { value: any; }) => d.value) as number * 1.1])
      .range([height - margin.bottom, margin.top]);

    const g = svg.append('g');

    // Barras
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: { label: any; }) => x(d.label) as number)
      .attr('y', (d: { value: any; }) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d: { value: any; }) => height - margin.bottom - y(d.value))
      .attr('fill', '#3b82f6')
      .attr('rx', 4);

    // Valores no topo das barras
    g.selectAll('text.value')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value')
      .attr('x', (d: { label: any; }) => (x(d.label) as number) + x.bandwidth() / 2)
      .attr('y', (d: { value: any; }) => y(d.value) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f1f5f9')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .text((d: { value: any; }) => d.value);

    // Eixo X
    g.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px');

    g.selectAll('.domain, .tick line')
      .attr('stroke', '#475569');

    // Eixo Y
    g.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px');

    g.selectAll('.domain, .tick line')
      .attr('stroke', '#475569');

  }, []);

  // Gráfico de Situação
  useEffect(() => {
    if (!situacaoChartRef.current) return;

    const svg = d3.select(situacaoChartRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 300;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };

    const data = [
      { label: 'Celebrado', value: 182 },
      { label: 'Impedimento Técnico', value: 17 }
    ];

    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.4);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: { value: any; }) => d.value) as number * 1.1])
      .range([height - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(['#10b981', '#ef4444']);

    const g = svg.append('g');

    // Barras
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: { label: any; }) => x(d.label) as number)
      .attr('y', (d: { value: any; }) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d: { value: any; }) => height - margin.bottom - y(d.value))
      .attr('fill', (d: { label: any; }) => colorScale(d.label) as string)
      .attr('rx', 4);

    // Valores no topo das barras
    g.selectAll('text.value')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value')
      .attr('x', (d: { label: any; }) => (x(d.label) as number) + x.bandwidth() / 2)
      .attr('y', (d: { value: any; }) => y(d.value) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f1f5f9')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .text((d: { value: any; }) => d.value);

    // Eixo X
    g.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-25)');

    g.selectAll('.domain, .tick line')
      .attr('stroke', '#475569');

    // Eixo Y
    g.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px');

    g.selectAll('.domain, .tick line')
      .attr('stroke', '#475569');

  }, []);

  return (
    <section className="flex gap-6 flex-col p-6 bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-slate-100">Repasses</h1>
      </div>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="text-sm font-medium text-slate-400">Indicação (TOTAL)</div>
          <div className="text-2xl font-semibold text-slate-100 mt-1">245</div>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="text-sm font-medium text-slate-400">Processos SEI</div>
          <div className="text-2xl font-semibold text-slate-100 mt-1">189</div>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="text-sm font-medium text-slate-400">Representação</div>
          <div className="text-2xl font-semibold text-slate-100 mt-1">156</div>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="text-sm font-medium text-slate-400">Média - Elaboração Parecer</div>
          <div className="text-2xl font-semibold text-slate-100 mt-1">7.5 dias</div>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="text-sm font-medium text-slate-400">Média - Formalização</div>
          <div className="text-2xl font-semibold text-slate-100 mt-1">11.8 dias</div>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="text-sm font-medium text-slate-400">Contrapartida</div>
          <div className="text-2xl font-semibold text-slate-100 mt-1">R$ 2.4M</div>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="text-sm font-medium text-slate-400">Valor GND3</div>
          <div className="text-2xl font-semibold text-slate-100 mt-1">R$ 5.8M</div>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="text-sm font-medium text-slate-400">Valor GND4</div>
          <div className="text-2xl font-semibold text-slate-100 mt-1">R$ 3.2M</div>
        </div>
      </div>

      {/* Tabela: Demanda por Técnico */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">Demanda por Técnico</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  GND3
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  GND4
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  TM - Formalização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  TM - Parecer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {demandaPorTecnico.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                    {row.responsavel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {row.gnd3}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {row.gnd4}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {row.tmFormalizacao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {row.tmParecer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela: Status do Processo por Analista Responsável */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">Status do Processo por Analista Responsável</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Finalizado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {statusPorAnalista.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                    {row.responsavel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {row.finalizado}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela: Concluídos por Analista Responsável */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">Concluídos por Analista Responsável</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Finalizado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {concluidosPorAnalista.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                    {row.responsavel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {row.finalizado}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status dos Processos (Consolidados) */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Status dos Processos (Consolidados)</h2>
          <svg
            ref={statusChartRef}
            width="100%"
            height="300"
            viewBox="0 0 400 300"
            style={{ background: '#0f172a' }}
          />
        </div>

        {/* Situação */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Situação</h2>
          <svg
            ref={situacaoChartRef}
            width="100%"
            height="300"
            viewBox="0 0 400 300"
            style={{ background: '#0f172a' }}
          />
        </div>
      </div>
    </section>
  );
}