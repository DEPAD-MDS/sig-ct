import { useState, useMemo } from "react";
import Map from "~/components/data/Map";
import { useGeralData } from "~/hooks/dashboard/useGeralData";
import Modal from "~/components/Modal";
import Card from "~/components/data/Card";
import { FilterIcon, LoaderCircle, SparklesIcon } from "lucide-react";
import { Link } from "react-router";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Cores alternadas para as regiões
const REGION_COLORS = [
  "rgba(255, 99, 132, 0.6)",    // Vermelho
  "rgba(54, 162, 235, 0.6)",    // Azul
  "rgba(255, 205, 86, 0.6)",    // Amarelo
  "rgba(75, 192, 192, 0.6)",    // Verde-água
  "rgba(153, 102, 255, 0.6)",   // Roxo
  "rgba(255, 159, 64, 0.6)",    // Laranja
  "rgba(201, 203, 207, 0.6)",   // Cinza
  "rgba(255, 99, 71, 0.6)",     // Vermelho-tomate
];

// Cores padrão do dashboard para padronização
const DASHBOARD_COLORS = {
  // Cores de texto baseadas no tema escuro do dashboard
  text: {
    primary: '#ffffff',     // Branco para títulos principais
    secondary: '#d1d5db',   // Cinza claro para textos secundários
    tertiary: '#9ca3af',    // Cinza médio para legendas
    muted: '#6b7280',       // Cinza escuro para textos menos importantes
  },
  // Cores de fundo
  background: {
    primary: '#1f2937',     // Cinza escuro (bg-gray-800)
    secondary: '#374151',   // Cinza médio (bg-gray-700)
    card: '#111827',        // Cinza mais escuro para cards
  },
  // Cores de borda
  border: '#4b5563',        // Cinza borda (border-gray-700)
  // Cores de destaque
  accent: '#3b82f6',        // Azul para elementos destacados
};

function MinhaPage() {
  const { data: communities, isLoading, error } = useGeralData();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Calcular totais para os cards
  const totals = useMemo(() => {
    if (!communities || communities.length === 0) {
      return {
        entities: 0,
        totalVagas: 0,
        vagasMasculino: 0,
        vagasFeminino: 0,
        vagasMaes: 0,
        totalValorGlobal: 0,
      };
    }

    return communities.reduce(
      (acc, community) => {
        // Contar entidades com CNPJ válido
        if (community.cnpj && community.cnpj.trim() !== "") {
          acc.entities++;
        }

        // Somar vagas (convertendo string para número)
        const vagas = parseInt(community.vagas_contratadas) || 0;
        const masculino = parseInt(community.adulto_masc) || 0;
        const feminino = parseInt(community.adulto_feminino) || 0;
        const maes = parseInt(community.maes) || 0;

        acc.totalVagas += vagas;
        acc.vagasMasculino += masculino;
        acc.vagasFeminino += feminino;
        acc.vagasMaes += maes;

        // Somar valor global (removendo pontos e convertendo para número)
        const valor = parseFloat(
          community.previsao_recurso_anual?.replace(/\./g, "").replace(",", ".") || "0"
        );
        acc.totalValorGlobal += valor;

        return acc;
      },
      {
        entities: 0,
        totalVagas: 0,
        vagasMasculino: 0,
        vagasFeminino: 0,
        vagasMaes: 0,
        totalValorGlobal: 0,
      }
    );
  }, [communities]);

  // Dados para gráfico de pizza - Vagas contratadas
  const pieChartDataContratadas = useMemo(() => {
    const chartData = {
      labels: ["Masculino", "Feminino", "Mães"],
      datasets: [
        {
          data: [totals.vagasMasculino, totals.vagasFeminino, totals.vagasMaes],
          backgroundColor: [
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 99, 132, 0.8)",
            "rgba(75, 192, 192, 0.8)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
    return chartData;
  }, [totals]);

  // Dados para gráfico de pizza - Vagas totais (mesmos dados para exemplo)
  const pieChartDataTotais = useMemo(() => {
    return {
      ...pieChartDataContratadas,
      datasets: [
        {
          ...pieChartDataContratadas.datasets[0],
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(75, 192, 192, 0.6)",
          ],
        },
      ],
    };
  }, [pieChartDataContratadas]);

  // Dados para gráfico de barras horizontal - Comparação de vagas
  const horizontalBarChartData = useMemo(() => {
    return {
      labels: ['Vagas'],
      datasets: [
        {
          label: 'Masculino',
          data: [totals.vagasMasculino],
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderWidth: 2,
        },
        {
          label: 'Feminino',
          data: [totals.vagasFeminino],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderWidth: 2,
        },
        {
          label: 'Mães',
          data: [totals.vagasMaes],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderWidth: 2,
        },
      ],
    };
  }, [totals]);

  // Dados para gráfico de barras por região (com cores alternadas)
  const barChartDataRegiao = useMemo(() => {
    if (!communities) return { labels: [], datasets: [] };

    const regiaoCount = communities.reduce((acc, community) => {
      if (community.regiao && community.regiao.trim() !== "") {
        acc[community.regiao] = (acc[community.regiao] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(regiaoCount);
    const valores = Object.values(regiaoCount);

    // Criar cores alternadas baseadas nas regiões
    const backgroundColors = labels.map((_, index) => 
      REGION_COLORS[index % REGION_COLORS.length]
    );

    const borderColors = backgroundColors.map(color => 
      color.replace('0.6', '1')
    );

    return {
      labels,
      datasets: [
        {
          label: "", // RÓTULO REMOVIDO
          data: valores,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  }, [communities]);

  // Dados para gráfico de barras por estado (mantendo como estava)
  const barChartDataEstados = useMemo(() => {
    if (!communities) return { labels: [], datasets: [] };

    const estadosCount = communities.reduce((acc, community) => {
      if (community.uf && community.uf.trim() !== "") {
        acc[community.uf] = (acc[community.uf] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(estadosCount);
    const valores = Object.values(estadosCount);

    return {
      labels,
      datasets: [
        {
          label: "", // RÓTULO REMOVIDO
          data: valores,
          backgroundColor: "rgba(153, 102, 255, 0.6)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [communities]);

  // Paginação da tabela
  const paginatedCommunities = useMemo(() => {
    if (!communities) return [];
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return communities.slice(start, end);
  }, [communities, currentPage]);

  const totalPages = useMemo(() => {
    if (!communities) return 0;
    return Math.ceil(communities.length / itemsPerPage);
  }, [communities]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  // Configurações de fonte padronizadas
  const fontConfig = {
    family: "'Inter', 'Segoe UI', system-ui, sans-serif",
    sizes: {
      title: 26,
      subtitle: 18,
      axis: 16,
      legend: 16,
      tooltip: 15,
    },
    weights: {
      bold: 'bold' as const,
      normal: 'normal' as const,
    },
  };

  // Opções para os gráficos - COM CORES PADRONIZADAS
  const pieChartOptions = {
    responsive: true,
    color: DASHBOARD_COLORS.text.primary, // Cor padrão para todo o texto
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: DASHBOARD_COLORS.text.secondary, // Cinza claro para legendas
          font: {
            size: fontConfig.sizes.legend,
            weight: fontConfig.weights.bold,
            family: fontConfig.family,
          },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "DISTRIBUIÇÃO DE VAGAS",
        color: DASHBOARD_COLORS.text.primary, // Branco para título
        font: {
          size: fontConfig.sizes.title,
          weight: fontConfig.weights.bold,
          family: fontConfig.family,
        },
        padding: {
          top: 20,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: DASHBOARD_COLORS.background.secondary,
        titleColor: DASHBOARD_COLORS.text.primary,
        bodyColor: DASHBOARD_COLORS.text.secondary,
        borderColor: DASHBOARD_COLORS.border,
        borderWidth: 1,
        titleFont: {
          size: fontConfig.sizes.tooltip,
          family: fontConfig.family,
        },
        bodyFont: {
          size: fontConfig.sizes.tooltip,
          family: fontConfig.family,
        },
      },
    },
  };

  const horizontalBarChartOptions = {
    indexAxis: 'y' as const,
    color: DASHBOARD_COLORS.text.primary, // Cor padrão para todo o texto
    elements: {
      bar: {
        borderWidth: 3,
      },
    },
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: DASHBOARD_COLORS.text.secondary, // Padronizado
          font: {
            size: fontConfig.sizes.legend,
            weight: fontConfig.weights.bold,
            family: fontConfig.family,
          },
          padding: 25,
        },
      },
      title: {
        display: true,
        text: 'COMPARAÇÃO DE VAGAS POR CATEGORIA',
        color: DASHBOARD_COLORS.text.primary, // Padronizado
        font: {
          size: fontConfig.sizes.title,
          weight: fontConfig.weights.bold,
          family: fontConfig.family,
        },
        padding: {
          top: 25,
          bottom: 25,
        },
      },
      tooltip: {
        backgroundColor: DASHBOARD_COLORS.background.secondary,
        titleColor: DASHBOARD_COLORS.text.primary,
        bodyColor: DASHBOARD_COLORS.text.secondary,
        borderColor: DASHBOARD_COLORS.border,
        borderWidth: 1,
        titleFont: {
          size: fontConfig.sizes.tooltip,
          family: fontConfig.family,
        },
        bodyFont: {
          size: fontConfig.sizes.tooltip,
          family: fontConfig.family,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: DASHBOARD_COLORS.text.secondary, // Padronizado
          font: {
            size: fontConfig.sizes.axis,
            family: fontConfig.family,
          },
        },
        grid: {
          color: DASHBOARD_COLORS.border + '40', // Borda com transparência
        },
      },
      y: {
        ticks: {
          color: DASHBOARD_COLORS.text.secondary, // Padronizado
          font: {
            size: fontConfig.sizes.axis,
            family: fontConfig.family,
          },
        },
        grid: {
          color: DASHBOARD_COLORS.border + '40', // Borda com transparência
        },
      },
    },
  };

  // Opções para gráfico de barras por região - COM CORES PADRONIZADAS
  const barChartOptionsRegiao = {
    responsive: true,
    color: DASHBOARD_COLORS.text.primary, // Cor padrão para todo o texto
    plugins: {
      legend: {
        display: false, // LEGENDA REMOVIDA COMPLETAMENTE
      },
      title: {
        display: true,
        text: "COMUNIDADES POR REGIÃO",
        color: DASHBOARD_COLORS.text.primary, // Padronizado
        font: {
          size: fontConfig.sizes.title,
          weight: fontConfig.weights.bold,
          family: fontConfig.family,
        },
        padding: {
          top: 30,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: DASHBOARD_COLORS.background.secondary,
        titleColor: DASHBOARD_COLORS.text.primary,
        bodyColor: DASHBOARD_COLORS.text.secondary,
        borderColor: DASHBOARD_COLORS.border,
        borderWidth: 1,
        titleFont: {
          size: fontConfig.sizes.tooltip,
          family: fontConfig.family,
        },
        bodyFont: {
          size: fontConfig.sizes.tooltip,
          family: fontConfig.family,
        },
        callbacks: {
          label: function(context) {
            return `Comunidades: ${context.raw}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: DASHBOARD_COLORS.text.secondary, // Padronizado
          font: {
            size: fontConfig.sizes.axis,
            family: fontConfig.family,
          },
        },
        grid: {
          color: DASHBOARD_COLORS.border + '40', // Borda com transparência
        },
      },
      x: {
        ticks: {
          color: DASHBOARD_COLORS.text.secondary, // Padronizado
          font: {
            size: fontConfig.sizes.axis,
            family: fontConfig.family,
          },
        },
        grid: {
          color: DASHBOARD_COLORS.border + '40', // Borda com transparência
        },
      },
    },
  };

  // Opções para gráfico de barras por estado - COM CORES PADRONIZADAS
  const barChartOptions = {
    responsive: true,
    color: DASHBOARD_COLORS.text.primary, // Cor padrão para todo o texto
    plugins: {
      legend: {
        display: false, // LEGENDA REMOVIDA COMPLETAMENTE
      },
      title: {
        display: true,
        text: "COMUNIDADES POR ESTADO",
        color: DASHBOARD_COLORS.text.primary, // Padronizado
        font: {
          size: fontConfig.sizes.title,
          weight: fontConfig.weights.bold,
          family: fontConfig.family,
        },
        padding: {
          top: 30,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: DASHBOARD_COLORS.background.secondary,
        titleColor: DASHBOARD_COLORS.text.primary,
        bodyColor: DASHBOARD_COLORS.text.secondary,
        borderColor: DASHBOARD_COLORS.border,
        borderWidth: 1,
        titleFont: {
          size: fontConfig.sizes.tooltip,
          family: fontConfig.family,
        },
        bodyFont: {
          size: fontConfig.sizes.tooltip,
          family: fontConfig.family,
        },
        callbacks: {
          label: function(context) {
            return `Comunidades: ${context.raw}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: DASHBOARD_COLORS.text.secondary, // Padronizado
          font: {
            size: fontConfig.sizes.axis,
            family: fontConfig.family,
          },
        },
        grid: {
          color: DASHBOARD_COLORS.border + '40', // Borda com transparência
        },
      },
      x: {
        ticks: {
          color: DASHBOARD_COLORS.text.secondary, // Padronizado
          font: {
            size: fontConfig.sizes.axis,
            family: fontConfig.family,
          },
        },
        grid: {
          color: DASHBOARD_COLORS.border + '40', // Borda com transparência
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full relative">
        <div className="flex w-76 items-center flex-col border bg-gray-800 border-gray-700 rounded-2xl p-6">
          <h1 className="text-2xl font-semibold">Carregando dados</h1>
          <p className="text-sm text-center opacity-50 mb-6">
            Estamos consultando e armazenando os dados
          </p>
          <div>
            <LoaderCircle className="opacity-80 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error(error);
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex w-2/4 items-center flex-col border bg-gray-800 border-gray-700 rounded-2xl p-6">
          <h1 className="text-2xl font-semibold text-center text-red-500">
            Erro ao consultar os dados
          </h1>
          <p className="text-sm text-center opacity-50 mb-6">
            Ops... Algo deu errado, faça login novamente.
          </p>
          <div className="gap-4 flex">
            <Link
              to={"/"}
              className="border border-gray-600 p-2 px-8 rounded-xl hover:bg-gray-700 transition-all cursor-pointer"
            >
              Entrar novamente
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="flex flex-row justify-between items-center w-full">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard geral</h1>
          <p className="text-base text-gray-300"> {/* Cor padronizada */}
            Página de repasses das comunidades
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setIsFilterOpen(true);
            }}
            className="flex justify-center items-center gap-2 text-base border px-5 py-3 rounded-md border-gray-700 hover:bg-gray-700 hover:border-gray-600 transition-all cursor-pointer text-gray-200" /* Cor padronizada */
          >
            <FilterIcon size={18} /> Filtros
          </button>
          <button
            onClick={() => {
              setIsCreateOpen(true);
            }}
            className="text-base gap-2 flex flex-row items-center justify-center border px-5 py-3 rounded-md border-gray-700 hover:bg-gray-700 hover:border-gray-600 transition-all cursor-pointer text-gray-200" /* Cor padronizada */
          >
            <SparklesIcon size={18} /> Criar apresentação
          </button>
        </div>
        <Modal isActive={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
          Aqui vão os filtros
        </Modal>
        <Modal isActive={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
          Aqui é a criação das apresentações
        </Modal>
      </div>
      <div className="w-full h-px my-6 bg-gray-700" />
      <section className="flex gap-6 flex-col">
        <div className="flex flex-row gap-5">
          <Card 
            title="Entidades com vínculo" 
            type="numeral" 
            value={totals.entities.toString()} 
          />
          <Card 
            title="Total de vagas geral" 
            type="numeral" 
            value={totals.totalVagas.toString()} 
          />
          <Card
            title="Total de vagas masculino"
            type="numeral"
            value={totals.vagasMasculino.toString()}
          />
          <Card
            title="Total de vagas feminino"
            type="numeral"
            value={totals.vagasFeminino.toString()}
          />
          <Card
            title="Total de vagas mães"
            type="numeral"
            value={totals.vagasMaes.toString()}
          />
          <Card 
            title="Total valor global" 
            type="monetário" 
            value={totals.totalValorGlobal.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })} 
          />
        </div>
        
        <h1 className="text-2xl font-bold text-white">Mapa geral das comunidades</h1>
        <Map dataReq={communities} />  
        <h1 className="text-2xl font-bold text-white">Gráficos por vagas totais</h1>
        <div className="border border-gray-700 rounded-lg p-5 bg-gray-800">
          <Bar data={horizontalBarChartData} options={horizontalBarChartOptions} />
        </div>
        
        <h1 className="text-2xl font-bold text-white">Gráfico por região</h1>
        <div className="border border-gray-700 rounded-lg p-5 bg-gray-800">
          <Bar data={barChartDataRegiao} options={barChartOptionsRegiao} />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-white mb-5">Gráficos por estado</h1>
          <div className="border border-gray-700 rounded-lg p-5 bg-gray-800">
            <Bar data={barChartDataEstados} options={barChartOptions} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white">Tabela resumida das comunidades</h1>
        <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-base text-left">
              <thead className="text-sm uppercase bg-gray-700">
                <tr>
                  <th scope="col" className="px-7 py-4 text-gray-300"> {/* Cor padronizada */}
                    CNPJ
                  </th>
                  <th scope="col" className="px-7 py-4 text-gray-300">
                    Razão Social
                  </th>
                  <th scope="col" className="px-7 py-4 text-gray-300">
                    UF
                  </th>
                  <th scope="col" className="px-7 py-4 text-gray-300">
                    Município
                  </th>
                  <th scope="col" className="px-7 py-4 text-gray-300">
                    Vagas Contratadas
                  </th>
                  <th scope="col" className="px-7 py-4 text-gray-300">
                    Masculino
                  </th>
                  <th scope="col" className="px-7 py-4 text-gray-300">
                    Feminino
                  </th>
                  <th scope="col" className="px-7 py-4 text-gray-300">
                    Mães
                  </th>
                  <th scope="col" className="px-7 py-4 text-gray-300">
                    Valor Anual
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCommunities.length > 0 ? (
                  paginatedCommunities.map((community, index) => (
                    <tr 
                      key={`${community.cnpj}-${index}`} 
                      className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-7 py-5 font-medium text-gray-200"> {/* Cor padronizada */}
                        {community.cnpj || '-'}
                      </td>
                      <td className="px-7 py-5 text-gray-300">
                        {community.razao_social || '-'}
                      </td>
                      <td className="px-7 py-5 text-gray-300">
                        {community.uf || '-'}
                      </td>
                      <td className="px-7 py-5 text-gray-300">
                        {community.municipio || '-'}
                      </td>
                      <td className="px-7 py-5 text-gray-300 text-center">
                        {community.vagas_contratadas || '0'}
                      </td>
                      <td className="px-7 py-5 text-gray-300 text-center">
                        {community.adulto_masc || '0'}
                      </td>
                      <td className="px-7 py-5 text-gray-300 text-center">
                        {community.adulto_feminino || '0'}
                      </td>
                      <td className="px-7 py-5 text-gray-300 text-center">
                        {community.maes || '0'}
                      </td>
                      <td className="px-7 py-5 text-gray-300">
                        {community.previsao_recurso_anual 
                          ? `R$ ${community.previsao_recurso_anual}` 
                          : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-7 py-10 text-center text-gray-400"> {/* Cor padronizada */}
                      Nenhuma comunidade encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Controles de paginação */}
          <div className="flex items-center justify-between px-7 py-5 bg-gray-750 border-t border-gray-700">
            <div className="text-base text-gray-400">
              Mostrando {currentPage * itemsPerPage + 1} a{' '}
              {Math.min((currentPage + 1) * itemsPerPage, communities?.length || 0)} de{' '}
              {communities?.length || 0} comunidades
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="px-5 py-3 text-base border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-200" /* Cor padronizada */
              >
                ← Anterior
              </button>
              <div className="flex items-center px-5 py-3 text-base text-gray-300">
                Página {currentPage + 1} de {totalPages}
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
                className="px-5 py-3 text-base border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-200" /* Cor padronizada */
              >
                Próximo →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MinhaPage;