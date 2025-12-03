import React, { useState } from "react";
import { FilterIcon, SparklesIcon, MapPin, TrendingUp, BarChart3 } from "lucide-react";
import Modal from "~/components/Modal";
import PresentationModal from "~/components/PresentationModal";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Dados para o mapa (simplificado)
const brazilRegions = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "Norte", value: 45 }, geometry: { type: "Polygon", coordinates: [] } },
    { type: "Feature", properties: { name: "Nordeste", value: 120 }, geometry: { type: "Polygon", coordinates: [] } },
    { type: "Feature", properties: { name: "Centro-Oeste", value: 65 }, geometry: { type: "Polygon", coordinates: [] } },
    { type: "Feature", properties: { name: "Sudeste", value: 185 }, geometry: { type: "Polygon", coordinates: [] } },
    { type: "Feature", properties: { name: "Sul", value: 95 }, geometry: { type: "Polygon", coordinates: [] } },
  ],
};

// Tipos TypeScript
interface ProtocolData {
  year: string;
  entities: number;
}

interface RegionData {
  name: string;
  value: number;
}

interface OriginData {
  origin: string;
  count: number;
}

interface EntryPointData {
  entryPoint: string;
  count: number;
}

interface ConcessionRenovationData {
  type: string;
  value: number;
  percentage: number;
  color: string;
}

// Interface para o objeto de dados consolidado
interface CebasData {
  totalSolicitations: number;
  concessionRenovationData: ConcessionRenovationData[];
  temporalData: ProtocolData[];
  regionData: RegionData[];
  originData: OriginData[];
  entryPointData: EntryPointData[];
}

export default function Cebas() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Dados consolidados em um único objeto JSON
  const cebasData: CebasData = {
    totalSolicitations: 380,
    
    concessionRenovationData: [
      { type: "Concessão", value: 302, percentage: 79.5, color: "#10b981" },
      { type: "Renovação", value: 78, percentage: 20.5, color: "#3b82f6" },
    ],

    temporalData: [
      { year: "2020", entities: 42 },
      { year: "2021", entities: 68 },
      { year: "2022", entities: 95 },
      { year: "2023", entities: 120 },
      { year: "2024", entities: 152 },
      { year: "2025", entities: 185 },
    ],

    regionData: [
      { name: "Sudeste", value: 185 },
      { name: "Nordeste", value: 120 },
      { name: "Sul", value: 95 },
      { name: "Norte", value: 45 },
      { name: "Centro-Oeste", value: 65 },
    ],

    originData: [
      { origin: "Secretaria de Educação Municipal", count: 145 },
      { origin: "Secretaria de Saúde Estadual", count: 98 },
      { origin: "Organização da Sociedade Civil", count: 76 },
      { origin: "Fundação Privada", count: 32 },
      { origin: "Associação Comunitária", count: 29 },
    ],

    entryPointData: [
      { entryPoint: "Portal Gov.br", count: 210 },
      { entryPoint: "Sistema CEBAS Online", count: 125 },
      { entryPoint: "Protocolo Físico", count: 35 },
      { entryPoint: "Email Institucional", count: 10 },
    ],
  };

  // Desestruturação para uso nos componentes
  const {
    totalSolicitations,
    concessionRenovationData,
    temporalData,
    regionData,
    originData,
    entryPointData
  } = cebasData;

  // Configurações do gráfico de linha (Evolução Temporal)
  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#cbd5e1",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#f1f5f9",
        bodyColor: "#cbd5e1",
        borderColor: "#475569",
        borderWidth: 1,
        callbacks: {
          label: (context) => `Entidades: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "#334155",
        },
        ticks: {
          color: "#94a3b8",
        },
      },
      y: {
        grid: {
          color: "#334155",
        },
        ticks: {
          color: "#94a3b8",
          callback: (value) => value.toString(),
        },
        beginAtZero: true,
      },
    },
  };

  const lineChartData = {
    labels: temporalData.map(d => d.year),
    datasets: [
      {
        label: "Entidades Protocoladas",
        data: temporalData.map(d => d.entities),
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "#8b5cf6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  // Configurações do gráfico de barras horizontais (Origem e Fluxo)
  const barChartOptions: ChartOptions<"bar"> = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#f1f5f9",
        bodyColor: "#cbd5e1",
        borderColor: "#475569",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: "#334155",
        },
        ticks: {
          color: "#94a3b8",
        },
      },
      y: {
        grid: {
          color: "#334155",
        },
        ticks: {
          color: "#94a3b8",
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const originBarData = {
    labels: originData.map(d => d.origin),
    datasets: [
      {
        label: "Quantidade",
        data: originData.map(d => d.count),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "#3b82f6",
          "#10b981",
          "#8b5cf6",
          "#f59e0b",
          "#ef4444",
        ],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const entryBarData = {
    labels: entryPointData.map(d => d.entryPoint),
    datasets: [
      {
        label: "Quantidade",
        data: entryPointData.map(d => d.count),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(245, 158, 11, 0.8)",
        ],
        borderColor: [
          "#3b82f6",
          "#10b981",
          "#8b5cf6",
          "#f59e0b",
        ],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Configurações do donut chart
  const donutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#cbd5e1",
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#f1f5f9",
        bodyColor: "#cbd5e1",
        borderColor: "#475569",
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            const total = concessionRenovationData.reduce((sum, item) => sum + item.value, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const donutData = {
    labels: concessionRenovationData.map(d => d.type),
    datasets: [
      {
        data: concessionRenovationData.map(d => d.value),
        backgroundColor: concessionRenovationData.map(d => d.color),
        borderColor: "#1e293b",
        borderWidth: 2,
      },
    ],
  };

  // Estilo para o mapa
  const mapStyle = (feature: any) => {
    const value = feature?.properties?.value || 0;
    const maxValue = Math.max(...regionData.map(r => r.value));
    const intensity = value / maxValue;
    
    return {
      fillColor: `rgb(59, 130, 246, ${0.3 + intensity * 0.7})`,
      weight: 1,
      opacity: 1,
      color: "#3b82f6",
      fillOpacity: 0.7,
    };
  };

  return (
    <section className="flex flex-col p-6 bg-slate-900 min-h-screen">
      <div className="flex flex-row justify-between items-center w-full">
        <div>
          <h1 className="text-2xl font-semibold">CEBAS</h1>
          <p className="text-sm opacity-60">
            Certificação de Entidades Beneficentes de Assistência Social
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="relative text-sm gap-2 flex flex-row items-center justify-center border px-4 py-2 rounded-md border-gray-700 hover:border-gray-600 transition-all cursor-pointer overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-2">
              <SparklesIcon size={15} /> Criar apresentação
            </span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 blur-md" />
          </button>
        </div>
      </div>
      
      <div className="w-full h-px my-4 flex bg-gray-700" />
      
      <div className="flex flex-col gap-6">
        {/* A. Topo (Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Card principal */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-400 mb-1">
                  Total de Solicitações
                </div>
                <div className="text-4xl font-bold text-slate-100">
                  {totalSolicitations.toLocaleString()}
                </div>
                <div className="text-sm text-slate-500 mt-2">
                  Período: 2020-2025
                </div>
              </div>
              <div className="text-slate-400">
                <BarChart3 size={48} />
              </div>
            </div>
          </div>

          {/* Cards comparativos */}
          <div className="grafico bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-slate-400">
                Concessão vs Renovação
              </div>
              <div className="text-slate-400">
                <TrendingUp size={20} />
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-32 h-32">
                <Doughnut options={donutOptions} data={donutData} />
              </div>
              
              <div className="ml-4 space-y-3">
                {concessionRenovationData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-200">
                        {item.type}
                      </div>
                      <div className="text-xs text-slate-400">
                        {item.value} ({item.percentage}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* B. Evolução Temporal */}
        <div className="grafico bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">
                Evolução Temporal
              </h2>
              <p className="text-sm text-slate-400">
                Entidades protocoladas por ano (2020–2025)
              </p>
            </div>
            <div className="text-slate-400">
              <TrendingUp size={24} />
            </div>
          </div>
          
          <div className="h-80">
            <Line options={lineChartOptions} data={lineChartData} />
          </div>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-2">
            {temporalData.map((item, index) => (
              <div 
                key={index}
                className="bg-slate-900 rounded-lg p-3 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="text-sm text-slate-400">{item.year}</div>
                <div className="text-lg font-semibold text-slate-100">
                  {item.entities}
                </div>
                <div className="text-xs text-slate-500">entidades</div>
              </div>
            ))}
          </div>
        </div>

        {/* C. Distribuição Geográfica */}
        <div className="grafico bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">
                Distribuição Geográfica
              </h2>
              <p className="text-sm text-slate-400">
                Entidades por região do Brasil
              </p>
            </div>
            <div className="text-slate-400">
              <MapPin size={24} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96">
              <div className="bg-slate-900 rounded-lg h-full flex items-center justify-center border border-slate-700">
                <MapContainer
                  center={[-15, -55]}
                  zoom={4}
                  className="h-full w-full rounded-lg"
                  style={{ backgroundColor: "#0f172a" }}
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <GeoJSON
                    data={brazilRegions as any}
                    style={mapStyle}
                    onEachFeature={(feature, layer) => {
                      const regionName = feature.properties?.name;
                      const value = feature.properties?.value;
                      layer.bindTooltip(`
                        <div class="text-slate-900">
                          <strong>${regionName}</strong><br/>
                          Entidades: ${value}
                        </div>
                      `);
                    }}
                  />
                </MapContainer>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200 mb-4">
                Ranking por Região
              </h3>
              {regionData
                .sort((a, b) => b.value - a.value)
                .map((region, index) => (
                  <div
                    key={index}
                    className="bg-slate-900 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full mr-3">
                          <span className="text-sm font-semibold text-slate-300">
                            {index + 1}
                          </span>
                        </div>
                        <span className="font-medium text-slate-200">
                          {region.name}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-slate-100">
                        {region.value}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(region.value / Math.max(...regionData.map(r => r.value))) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* D. Origem e Fluxo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Origem do Protocolo */}
          <div className="grafico bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-2">
                Origem do Protocolo
              </h2>
              <p className="text-sm text-slate-400">
                Principais tipos de entidades solicitantes
              </p>
            </div>
            
            <div className="h-72">
              <Bar options={barChartOptions} data={originBarData} />
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2">
              {originData.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-900 rounded-lg p-3 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="text-xs text-slate-400 truncate">
                    {item.origin}
                  </div>
                  <div className="text-lg font-semibold text-slate-100">
                    {item.count}
                  </div>
                  <div className="text-xs text-slate-500">solicitações</div>
                </div>
              ))}
            </div>
          </div>

          {/* Porta de Entrada */}
          <div className="grafico bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-2">
                Porta de Entrada
              </h2>
              <p className="text-sm text-slate-400">
                Canais utilizados para protocolo
              </p>
            </div>
            
            <div className="h-72">
              <Bar options={barChartOptions} data={entryBarData} />
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2">
              {entryPointData.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-900 rounded-lg p-3 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="text-xs text-slate-400 truncate">
                    {item.entryPoint}
                  </div>
                  <div className="text-lg font-semibold text-slate-100">
                    {item.count}
                  </div>
                  <div className="text-xs text-slate-500">protocolos</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PresentationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        data={cebasData} // Passando todos os dados consolidados
      />
    </section>
  );
}