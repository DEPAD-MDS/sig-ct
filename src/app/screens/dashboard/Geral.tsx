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

  // Dados para gráfico de barras por região (mesmo formato do gráfico por estados)
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

    return {
      labels,
      datasets: [
        {
          label: "Número de Comunidades",
          data: valores,
          backgroundColor: "rgba(255, 159, 64, 0.6)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [communities]);

  // Dados para gráfico de barras por estado
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
          label: "Número de Comunidades",
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

  // Opções para os gráficos
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "Distribuição de Vagas",
      },
    },
  };

  const horizontalBarChartOptions = {
    indexAxis: 'y' as const,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Comparação de Vagas por Categoria',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  // Opções para gráfico de barras por região (mesmo formato do gráfico por estados)
  const barChartOptionsRegiao = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Comunidades por Região",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Opções para gráfico de barras por estado
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Comunidades por Estado",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
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
          <h1 className="text-2xl font-semibold">Dashboard geral</h1>
          <p className="text-sm opacity-60">
            Página de repasses das comunidades
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setIsFilterOpen(true);
            }}
            className=" flex justify-center items-center gap-2 text-sm border px-4 py-2 rounded-md border-gray-700 hover:bg-gray-700 hover:border-gray-600 transition-all cursor-pointer"
          >
            <FilterIcon size={15} /> Filtros
          </button>
          <button
            onClick={() => {
              setIsCreateOpen(true);
            }}
            className="text-sm gap-2 flex flex-row items-center justify-center border px-4 py-2 rounded-md border-gray-700 hover:bg-gray-700 hover:border-gray-600 transition-all cursor-pointer"
          >
            <SparklesIcon size={15} /> Criar apresentação
          </button>
        </div>
        <Modal isActive={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
          Aqui vão os filtros
        </Modal>
        <Modal isActive={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
          Aqui é a criação das apresentações
        </Modal>
      </div>
      <div className="w-full h-px my-4 bg-gray-700" />
      <section className="flex gap-4 flex-col">
        <div className="flex flex-row gap-4">
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
        
        <h1 className="text-xl font-semibold">Mapa geral das comunidades</h1>
        <Map dataReq={communities} />
        
        <h1 className="text-xl font-semibold">Gráficos por vagas contratadas</h1>
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
          <Bar data={horizontalBarChartData} options={horizontalBarChartOptions} />
        </div>
        
        <h1 className="text-xl font-semibold">Gráficos por vagas totais</h1>
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
          <Bar data={horizontalBarChartData} options={horizontalBarChartOptions} />
        </div>
        
        <h1 className="text-xl font-semibold">Gráfico por região</h1>
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
          <Bar data={barChartDataRegiao} options={barChartOptionsRegiao} />
        </div>
        
        <div>
          <h1 className="text-xl font-semibold mb-4">Gráficos por estado</h1>
          <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
            <Bar data={barChartDataEstados} options={barChartOptions} />
          </div>
        </div>
        
        <h1 className="text-xl font-semibold">Tabela resumida das comunidades</h1>
        <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-700 text-gray-300">
                <tr>
                  <th scope="col" className="px-6 py-3">CNPJ</th>
                  <th scope="col" className="px-6 py-3">Razão Social</th>
                  <th scope="col" className="px-6 py-3">UF</th>
                  <th scope="col" className="px-6 py-3">Município</th>
                  <th scope="col" className="px-6 py-3">Vagas Contratadas</th>
                  <th scope="col" className="px-6 py-3">Masculino</th>
                  <th scope="col" className="px-6 py-3">Feminino</th>
                  <th scope="col" className="px-6 py-3">Mães</th>
                  <th scope="col" className="px-6 py-3">Valor Anual</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCommunities.length > 0 ? (
                  paginatedCommunities.map((community, index) => (
                    <tr 
                      key={`${community.cnpj}-${index}`} 
                      className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-200">
                        {community.cnpj || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {community.razao_social || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {community.uf || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {community.municipio || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-center">
                        {community.vagas_contratadas || '0'}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-center">
                        {community.adulto_masc || '0'}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-center">
                        {community.adulto_feminino || '0'}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-center">
                        {community.maes || '0'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {community.previsao_recurso_anual 
                          ? `R$ ${community.previsao_recurso_anual}` 
                          : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-400">
                      Nenhuma comunidade encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Controles de paginação */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-750 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Mostrando {currentPage * itemsPerPage + 1} a{' '}
              {Math.min((currentPage + 1) * itemsPerPage, communities?.length || 0)} de{' '}
              {communities?.length || 0} comunidades
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="px-4 py-2 text-sm border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← Anterior
              </button>
              <div className="flex items-center px-4 py-2 text-sm text-gray-300">
                Página {currentPage + 1} de {totalPages}
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 text-sm border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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