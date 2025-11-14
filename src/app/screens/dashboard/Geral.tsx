import { useState } from "react";
import Map from "~/components/data/Map";
import { useGeralData } from "~/hooks/dashboard/useGeralData";
import Modal from "~/components/Modal";
import {
  FilterIcon,
  LoaderCircle,
  LoaderIcon,
  Scan,
  ScanText,
  SparklesIcon,
  StarHalfIcon,
  StarIcon,
} from "lucide-react";
import { Link } from "react-router";

function MinhaPage() {
  const { communities, loading, error } = useGeralData();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  if (loading) {
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
  const Card = () => {
    return (
      <div className="w-full gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="text-sm font-medium text-slate-400">
            Titulo do dado
          </div>
          <div className="text-2xl font-semibold text-slate-100 mt-1">
            Valor
          </div>
        </div>
      </div>
    );
  };
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
          <Card></Card>
          <Card></Card>
          <Card></Card>
          <Card></Card>
          <Card></Card>
        </div>
        <h1 className="text-xl font-semibold">Mapa geral das comunidades</h1>
        <Map dataReq={communities} />
        <h1 className="text-xl font-semibold">
          Gráficos por vagas contratadas
        </h1>
        aqui é aquele pizza sobre femin masculin e maes
        <h1 className="text-xl font-semibold">Gráficos por vagas totais</h1>
        aqui é aquele pizza sobre femin masculin e maes
        <h1 className="text-xl font-semibold">Gráficos por estado</h1>
        aqui é aquele barra sobre os estados
        <h1 className="text-xl font-semibold">
          Tabela resumida das comunidades
        </h1>
      </section>
    </div>
  );
}

export default MinhaPage;
