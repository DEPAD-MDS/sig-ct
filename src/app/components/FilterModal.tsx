import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check } from "lucide-react";

interface Community {
  cnpj?: string;
  razao_social?: string;
  uf?: string;
  municipio?: string;
  regiao?: string;
  vagas_contratadas?: string;
  adulto_masc?: string;
  adulto_feminino?: string;
  maes?: string;
  previsao_recurso_anual?: string;
}

interface FilterState {
  regiao: string[];
  uf: string[];
  municipio: string[];
  vagasMin: string;
  vagasMax: string;
  ordenacao: 'crescente' | 'decrescente' | '';
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Community[];
  onApplyFilters: (filters: FilterState) => void;
}

export default function FilterModal({ isOpen, onClose, data, onApplyFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>({
    regiao: [],
    uf: [],
    municipio: [],
    vagasMin: '',
    vagasMax: '',
    ordenacao: ''
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Extrair opções únicas dos dados
  const options = useMemo(() => {
    const regioes = new Set<string>();
    const ufs = new Set<string>();
    const municipios = new Set<string>();

    data.forEach(item => {
      if (item.regiao?.trim()) regioes.add(item.regiao.trim());
      if (item.uf?.trim()) ufs.add(item.uf.trim());
      if (item.municipio?.trim()) municipios.add(item.municipio.trim());
    });

    return {
      regioes: Array.from(regioes).sort(),
      ufs: Array.from(ufs).sort(),
      municipios: Array.from(municipios).sort()
    };
  }, [data]);

  const handleToggleOption = (type: 'regiao' | 'uf' | 'municipio', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      regiao: [],
      uf: [],
      municipio: [],
      vagasMin: '',
      vagasMax: '',
      ordenacao: ''
    });
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-xl bg-gray-800 border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Filtros</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Região */}
              <div>
                <label className="block text-sm font-medium mb-2">Região</label>
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === 'regiao' ? null : 'regiao')}
                    className="w-full flex justify-between items-center bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-left hover:bg-gray-650 transition-colors"
                  >
                    <span className="text-sm">
                      {filters.regiao.length > 0 
                        ? `${filters.regiao.length} selecionado(s)` 
                        : 'Selecione as regiões'}
                    </span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${openDropdown === 'regiao' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'regiao' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-10 w-full mt-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                      >
                        {options.regioes.map(regiao => (
                          <button
                            key={regiao}
                            onClick={() => handleToggleOption('regiao', regiao)}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-600 transition-colors"
                          >
                            <span>{regiao}</span>
                            {filters.regiao.includes(regiao) && <Check size={16} className="text-green-400" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* UF */}
              <div>
                <label className="block text-sm font-medium mb-2">Estado (UF)</label>
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === 'uf' ? null : 'uf')}
                    className="w-full flex justify-between items-center bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-left hover:bg-gray-650 transition-colors"
                  >
                    <span className="text-sm">
                      {filters.uf.length > 0 
                        ? `${filters.uf.length} selecionado(s)` 
                        : 'Selecione os estados'}
                    </span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${openDropdown === 'uf' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'uf' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-10 w-full mt-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                      >
                        {options.ufs.map(uf => (
                          <button
                            key={uf}
                            onClick={() => handleToggleOption('uf', uf)}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-600 transition-colors"
                          >
                            <span>{uf}</span>
                            {filters.uf.includes(uf) && <Check size={16} className="text-green-400" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Município */}
              <div>
                <label className="block text-sm font-medium mb-2">Município</label>
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === 'municipio' ? null : 'municipio')}
                    className="w-full flex justify-between items-center bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-left hover:bg-gray-650 transition-colors"
                  >
                    <span className="text-sm">
                      {filters.municipio.length > 0 
                        ? `${filters.municipio.length} selecionado(s)` 
                        : 'Selecione os municípios'}
                    </span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${openDropdown === 'municipio' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'municipio' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-10 w-full mt-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                      >
                        {options.municipios.map(municipio => (
                          <button
                            key={municipio}
                            onClick={() => handleToggleOption('municipio', municipio)}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-600 transition-colors"
                          >
                            <span>{municipio}</span>
                            {filters.municipio.includes(municipio) && <Check size={16} className="text-green-400" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Ordenação */}
              <div>
                <label className="block text-sm font-medium mb-2">Ordenar por vagas</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, ordenacao: prev.ordenacao === 'crescente' ? '' : 'crescente' }))}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                      filters.ordenacao === 'crescente'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-650'
                    }`}
                  >
                    Crescente
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, ordenacao: prev.ordenacao === 'decrescente' ? '' : 'decrescente' }))}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                      filters.ordenacao === 'decrescente'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-650'
                    }`}
                  >
                    Decrescente
                  </button>
                </div>
              </div>

              {/* Range de Vagas */}
              <div>
                <label className="block text-sm font-medium mb-2">Quantidade de vagas</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={filters.vagasMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, vagasMin: e.target.value }))}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={filters.vagasMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, vagasMax: e.target.value }))}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-650 transition-all"
              >
                Resetar
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2 bg-blue-600 border border-blue-500 rounded-lg hover:bg-blue-700 transition-all"
              >
                Aplicar Filtros
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}