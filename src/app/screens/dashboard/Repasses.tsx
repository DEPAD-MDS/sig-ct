import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { SparklesIcon } from "lucide-react";
import PresentationModal from "../../components/PresentationModal";

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
  const statusChartRef = useRef(null);
  const situacaoChartRef = useRef(null);

  // Mock data para as tabelas
  const demandaPorTecnico: TecnicoData[] = [
    {
      responsavel: "João Silva",
      gnd3: "25",
      gnd4: "18",
      tmFormalizacao: "12",
      tmParecer: "8",
    },
    {
      responsavel: "Maria Santos",
      gnd3: "32",
      gnd4: "22",
      tmFormalizacao: "10",
      tmParecer: "7",
    },
    {
      responsavel: "Pedro Costa",
      gnd3: "28",
      gnd4: "15",
      tmFormalizacao: "14",
      tmParecer: "9",
    },
    {
      responsavel: "Ana Oliveira",
      gnd3: "20",
      gnd4: "12",
      tmFormalizacao: "11",
      tmParecer: "6",
    },
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

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Preparar todos os dados do dashboard para passar ao modal
  const dashboardData = {
    indicadores: {
      indicacaoTotal: 245,
      processosSEI: 189,
      representacao: 156,
      mediaElaboracaoParecer: 7.5,
      mediaFormalizacao: 11.8,
      contrapartida: 2400000,
      valorGND3: 5800000,
      valorGND4: 3200000
    },
    demandaPorTecnico,
    statusPorAnalista,
    concluidosPorAnalista,
    graficos: {
      statusProcessos: [{ label: "Finalizado", value: 199 }],
      situacao: [
        { label: "Celebrado", value: 182 },
        { label: "Impedimento Técnico", value: 17 }
      ]
    }
  };

  // Gráfico de Status dos Processos (Consolidados)
  useEffect(() => {
    if (!statusChartRef.current) return;

    const svg = d3.select(statusChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 300;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };

    const data = [{ label: "Finalizado", value: 199 }];

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.4);

    const y = d3
      .scaleLinear()
      .domain([
        0,
        (d3.max(data, (d: { value: any }) => d.value) as number) * 1.1,
      ])
      .range([height - margin.bottom, margin.top]);

    const g = svg.append("g");

    // Barras
    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d: { label: any }) => x(d.label) as number)
      .attr("y", (d: { value: any }) => y(d.value))
      .attr("width", x.bandwidth())
      .attr(
        "height",
        (d: { value: any }) => height - margin.bottom - y(d.value)
      )
      .attr("fill", "#3b82f6")
      .attr("rx", 4);

    // Valores no topo das barras
    g.selectAll("text.value")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value")
      .attr(
        "x",
        (d: { label: any }) => (x(d.label) as number) + x.bandwidth() / 2
      )
      .attr("y", (d: { value: any }) => y(d.value) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#f1f5f9")
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .text((d: { value: any }) => d.value);

    // Eixo X
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "12px");

    g.selectAll(".domain, .tick line").attr("stroke", "#475569");

    // Eixo Y
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "12px");

    g.selectAll(".domain, .tick line").attr("stroke", "#475569");
  }, []);

  // Gráfico de Situação
  useEffect(() => {
    if (!situacaoChartRef.current) return;

    const svg = d3.select(situacaoChartRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 300;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };

    const data = [
      { label: "Celebrado", value: 182 },
      { label: "Impedimento Técnico", value: 17 },
    ];

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.4);

    const y = d3
      .scaleLinear()
      .domain([
        0,
        (d3.max(data, (d: { value: any }) => d.value) as number) * 1.1,
      ])
      .range([height - margin.bottom, margin.top]);

    const colorScale = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.label))
      .range(["#10b981", "#ef4444"]);

    const g = svg.append("g");

    // Barras
    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d: { label: any }) => x(d.label) as number)
      .attr("y", (d: { value: any }) => y(d.value))
      .attr("width", x.bandwidth())
      .attr(
        "height",
        (d: { value: any }) => height - margin.bottom - y(d.value)
      )
      .attr("fill", (d: { label: any }) => colorScale(d.label) as string)
      .attr("rx", 4);

    // Valores no topo das barras
    g.selectAll("text.value")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value")
      .attr(
        "x",
        (d: { label: any }) => (x(d.label) as number) + x.bandwidth() / 2
      )
      .attr("y", (d: { value: any }) => y(d.value) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#f1f5f9")
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .text((d: { value: any }) => d.value);

    // Eixo X
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "11px")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-25)");

    g.selectAll(".domain, .tick line").attr("stroke", "#475569");

    // Eixo Y
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "12px");

    g.selectAll(".domain, .tick line").attr("stroke", "#475569");
  }, []);

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Repasses</h1>
          <p className="text-sm text-gray-400">
            Página de repasses das comunidades
          </p>
        </div>
        <div className="flex flex-row gap-2">
          <div
            onClick={() => {
              setIsCreateOpen(true);
            }}
            className="text-sm gap-2 flex flex-row items-center justify-center border px-4 py-2 rounded-md border-gray-700 hover:bg-gray-700 hover:border-gray-600 transition-all cursor-pointer"
          >
            <SparklesIcon />
            Criar apresentação
          </div>
        </div>
      </div>

      <PresentationModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)}
        data={dashboardData}
      />

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Indicação (TOTAL)</p>
          <p className="text-2xl font-bold">245</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Processos SEI</p>
          <p className="text-2xl font-bold">189</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Representação</p>
          <p className="text-2xl font-bold">156</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Média - Elaboração Parecer</p>
          <p className="text-2xl font-bold">7.5 dias</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Média - Formalização</p>
          <p className="text-2xl font-bold">11.8 dias</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Contrapartida</p>
          <p className="text-2xl font-bold">R$ 2.4M</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Valor GND3</p>
          <p className="text-2xl font-bold">R$ 5.8M</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Valor GND4</p>
          <p className="text-2xl font-bold">R$ 3.2M</p>
        </div>
      </div>

      {/* Tabela: Demanda por Técnico */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Demanda por Técnico</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 text-sm font-medium text-gray-400">Responsável</th>
              <th className="text-left py-2 text-sm font-medium text-gray-400">GND3</th>
              <th className="text-left py-2 text-sm font-medium text-gray-400">GND4</th>
              <th className="text-left py-2 text-sm font-medium text-gray-400">TM - Formalização</th>
              <th className="text-left py-2 text-sm font-medium text-gray-400">TM - Parecer</th>
            </tr>
          </thead>
          <tbody>
            {demandaPorTecnico.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-700/50">
                <td className="py-2 text-sm">{row.responsavel}</td>
                <td className="py-2 text-sm">{row.gnd3}</td>
                <td className="py-2 text-sm">{row.gnd4}</td>
                <td className="py-2 text-sm">{row.tmFormalizacao}</td>
                <td className="py-2 text-sm">{row.tmParecer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabela: Status do Processo por Analista Responsável */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Status do Processo por Analista Responsável</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 text-sm font-medium text-gray-400">Responsável</th>
              <th className="text-left py-2 text-sm font-medium text-gray-400">Finalizado</th>
              <th className="text-left py-2 text-sm font-medium text-gray-400">Total</th>
            </tr>
          </thead>
          <tbody>
            {statusPorAnalista.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-700/50">
                <td className="py-2 text-sm">{row.responsavel}</td>
                <td className="py-2 text-sm">{row.finalizado}</td>
                <td className="py-2 text-sm">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabela: Concluídos por Analista Responsável */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Concluídos por Analista Responsável</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 text-sm font-medium text-gray-400">Responsável</th>
              <th className="text-left py-2 text-sm font-medium text-gray-400">Finalizado</th>
              <th className="text-left py-2 text-sm font-medium text-gray-400">Total</th>
            </tr>
          </thead>
          <tbody>
            {concluidosPorAnalista.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-700/50">
                <td className="py-2 text-sm">{row.responsavel}</td>
                <td className="py-2 text-sm">{row.finalizado}</td>
                <td className="py-2 text-sm">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-4">
        {/* Status dos Processos (Consolidados) */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Status dos Processos (Consolidados)</h2>
          <svg ref={statusChartRef} width="400" height="300"></svg>
        </div>

        {/* Situação */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Situação</h2>
          <svg ref={situacaoChartRef} width="400" height="300"></svg>
        </div>
      </div>
    </div>
  );
}