import { FilterIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import Modal from "~/components/Modal";

export default function Contratos(){
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  return(
    <div className="p-6">
       <div className="flex flex-row justify-between items-center w-full">
        <div>
          <h1 className="text-2xl font-semibold">Comunidades</h1>
          <p className="text-sm opacity-60">
            Página dos contratos das comunidades 
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
    </div>
  )
}