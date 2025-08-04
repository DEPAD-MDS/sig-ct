import LogoutMsal from "components/auth/LogoutMsal";
import { useMsal } from "@azure/msal-react";
import getGeralData from "services/sharepoint/dashboard/getGeralData";
import type { PublicClientApplication } from "@azure/msal-browser";
import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilter, FiSearch, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";

// Tipos melhorados
type TableData = {
  headers: string[];
  rows: string[][];
};

type DateRangeFilter = {
  from: string;
  to: string;
} | null;

type NumberRangeFilter = {
  min?: number;
  max?: number;
} | null;

type FilterConfig = {
  // Filtros para Geral
  adultoMasc?: NumberRangeFilter;
  adultoFeminino?: NumberRangeFilter;
  maes?: NumberRangeFilter;
  uf?: string;
  cidade?: string;
  municipio?: string;
  dataVencimento?: DateRangeFilter;
  dataInicial?: DateRangeFilter;
  
  // Filtros para CEBAS
  dataCronologica?: DateRangeFilter;
  tipoProcesso?: 'convenio' | 'termo de fomento' | null;
  
  // Filtros para Repasses
  contrapartida?: NumberRangeFilter;
  gnd3?: NumberRangeFilter;
  gnd4?: NumberRangeFilter;
  valorTotal?: NumberRangeFilter;
};

export default function Geral() {
  const [tableData, setTableData] = useState<TableData>({ headers: [], rows: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'geral' | 'cebas' | 'repasses'>('geral');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterConfig>({});
  const { instance } = useMsal();

  // Otimização: Memoize os índices das colunas
  const columnIndices = useMemo(() => {
    const indices: Record<string, number> = {};
    tableData.headers.forEach((header, index) => {
      indices[header] = index;
    });
    return indices;
  }, [tableData.headers]);

  // Busca os dados da API com tratamento de erro melhorado
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getGeralData(instance as PublicClientApplication);
        
        if (response?.text && Array.isArray(response.text) && response.text.length > 0) {
          const [headers, ...rows] = response.text;
          setTableData({ headers, rows });
        } else {
          console.error("Formato de dados inesperado:", response);
          setTableData({ headers: [], rows: [] });
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
        setTableData({ headers: [], rows: [] });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [instance]);

  // Otimização: Extrair valores únicos para selects
  const filterOptions = useMemo(() => {
    if (tableData.rows.length === 0) return { uf: [], cidade: [], municipio: [] };

    const ufSet = new Set<string>();
    const cidadeSet = new Set<string>();
    const municipioSet = new Set<string>();

    tableData.rows.forEach(row => {
      if (columnIndices['UF'] !== undefined && row[columnIndices['UF']]) {
        ufSet.add(row[columnIndices['UF']]);
      }
      if (columnIndices['CIDADE'] !== undefined && row[columnIndices['CIDADE']]) {
        cidadeSet.add(row[columnIndices['CIDADE']]);
      }
      if (columnIndices['MUNICIPIO'] !== undefined && row[columnIndices['MUNICIPIO']]) {
        municipioSet.add(row[columnIndices['MUNICIPIO']]);
      }
    });

    return {
      uf: Array.from(ufSet).sort(),
      cidade: Array.from(cidadeSet).sort(),
      municipio: Array.from(municipioSet).sort()
    };
  }, [tableData.rows, columnIndices]);

  // Filtra os dados baseado no termo de busca (CNPJ)
  const filteredData = useMemo(() => {
    if (!searchTerm) return tableData.rows;
    
    const cnpjIndex = columnIndices['CNPJ'];
    if (cnpjIndex === undefined) return tableData.rows;
    
    return tableData.rows.filter(row => 
      row[cnpjIndex]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, tableData.rows, columnIndices]);

  // Função para parsear números com vírgula decimal
  const parseNumber = useCallback((value: string): number => {
    if (!value) return 0;
    const cleaned = value.replace(/[^\d,-]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }, []);

  // Helper para verificar intervalo numérico
  const checkNumberRange = useCallback((valueStr: string, range?: NumberRangeFilter): boolean => {
    if (!range) return true;
    const value = parseNumber(valueStr);
    
    return (range.min === undefined || value >= range.min) && 
           (range.max === undefined || value <= range.max);
  }, [parseNumber]);

  // Helper para parsear datas
  const parseDate = useCallback((dateStr: string): Date | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }, []);

  // Helper para verificar intervalo de datas
  const checkDateRange = useCallback((dateStr: string, range?: DateRangeFilter): boolean => {
    if (!range || !dateStr) return true;
    const date = parseDate(dateStr);
    if (!date) return false;
    
    const from = range.from ? parseDate(range.from) : null;
    const to = range.to ? parseDate(range.to) : null;
    
    return (!from || date >= from) && (!to || date <= to);
  }, [parseDate]);

  // Aplica os filtros de forma mais eficiente
  const finalData = useMemo(() => {
    if (Object.keys(filters).length === 0) return filteredData;
    
    return filteredData.filter(row => {
      // Helper para obter valor da célula
      const getValue = (column: string) => {
        const index = columnIndices[column];
        return index !== undefined ? row[index] : null;
      };

      // Verifica todos os filtros
      return (
        // Filtros Gerais
        checkNumberRange(getValue('ADULTO MASC') || '', filters.adultoMasc) &&
        checkNumberRange(getValue('ADULTO FEMININO') || '', filters.adultoFeminino) &&
        checkNumberRange(getValue('MÃES') || '', filters.maes) &&
        (!filters.uf || getValue('UF')?.toLowerCase() === filters.uf.toLowerCase()) &&
        (!filters.cidade || getValue('CIDADE')?.toLowerCase().includes(filters.cidade.toLowerCase())) &&
        (!filters.municipio || getValue('MUNICIPIO')?.toLowerCase().includes(filters.municipio.toLowerCase())) &&
        checkDateRange(getValue('DATA VENCIMENTO CT') || '', filters.dataVencimento) &&
        checkDateRange(getValue('DATA INICIAL CT') || '', filters.dataInicial) &&
        
        // Filtros CEBAS
        checkDateRange(getValue('DATA CRONOLÓGICA') || '', filters.dataCronologica) &&
        (!filters.tipoProcesso || getValue('TIPO DE INSTRUMENTO')?.toLowerCase().includes(filters.tipoProcesso.toLowerCase())) &&
        
        // Filtros Repasses
        checkNumberRange(getValue('CONTRAPARTIDA') || '', filters.contrapartida) &&
        checkNumberRange(getValue('GND 3') || '', filters.gnd3) &&
        checkNumberRange(getValue('GND 4') || '', filters.gnd4) &&
        checkNumberRange(getValue('VALOR TOTAL GLOBAL') || '', filters.valorTotal)
      );
    });
  }, [filteredData, filters, columnIndices, checkNumberRange, checkDateRange]);

  // Calcula os totais para os cards de repasses de forma mais eficiente
  const repassesTotals = useMemo(() => {
    const gnd3Index = columnIndices['GND 3'];
    const gnd4Index = columnIndices['GND 4'];
    const contrapartidaIndex = columnIndices['CONTRAPARTIDA'];
    const totalGlobalIndex = columnIndices['VALOR TOTAL GLOBAL'];
    
    // Se não encontrou os índices, retorna zeros
    if (gnd3Index === undefined || gnd4Index === undefined || 
        contrapartidaIndex === undefined || totalGlobalIndex === undefined) {
      return {
        gnd3: 'R$ 0,00',
        gnd4: 'R$ 0,00',
        contrapartida: 'R$ 0,00',
        totalGlobal: 'R$ 0,00'
      };
    }
    
    let gnd3Total = 0;
    let gnd4Total = 0;
    let contrapartidaTotal = 0;
    let totalGlobal = 0;
    
    // Processa apenas os dados visíveis (já filtrados)
    finalData.forEach(row => {
      gnd3Total += parseNumber(row[gnd3Index]);
      gnd4Total += parseNumber(row[gnd4Index]);
      contrapartidaTotal += parseNumber(row[contrapartidaIndex]);
      totalGlobal += parseNumber(row[totalGlobalIndex]);
    });
    
    return {
      gnd3: gnd3Total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      gnd4: gnd4Total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      contrapartida: contrapartidaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      totalGlobal: totalGlobal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    };
  }, [finalData, columnIndices, parseNumber]);

  // Sugestões de CNPJ para a busca (limitado a 5)
  const cnpjSuggestions = useMemo(() => {
    const cnpjIndex = columnIndices['CNPJ'];
    if (cnpjIndex === undefined) return [];
    
    const uniqueCnps = new Set<string>();
    
    for (const row of tableData.rows) {
      if (row[cnpjIndex] && row[cnpjIndex].length > 0) {
        uniqueCnps.add(row[cnpjIndex]);
        if (uniqueCnps.size >= 5) break;
      }
    }
    
    return Array.from(uniqueCnps);
  }, [tableData.rows, columnIndices]);

  // Atualiza um filtro específico com tipagem segura
  const updateFilter = useCallback(<K extends keyof FilterConfig>(key: K, value: FilterConfig[K]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' || (value === null && key !== 'tipoProcesso') ? undefined : value
    }));
  }, []);

  // Renderiza a tabela com scroll horizontal
  const renderTable = (data: string[][]) => {
    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Nenhum dado encontrado
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {tableData.headers.map((header, index) => (
                <th 
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <motion.tr 
                key={rowIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex} 
                    className="px-4 py-2 whitespace-nowrap text-sm text-gray-500"
                  >
                    {cell || <span className="text-gray-300">-</span>}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="p-4">
        <div className="text-center py-8 text-gray-500">
          Carregando dados...
        </div>
      </section>
    );
  }

  return (
    <section className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard Geral</h1>
        <LogoutMsal />
      </div>

      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-200">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'geral' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('geral')}
        >
          Geral
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'cebas' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('cebas')}
        >
          CEBAS
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'repasses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('repasses')}
        >
          Repasses
        </button>
      </div>

      {/* Barra de pesquisa */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Buscar por CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setSearchTerm('')}
          >
            <FiX className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Sugestões de CNPJ */}
      {searchTerm && cnpjSuggestions.length > 0 && (
        <div className="mb-4 bg-white shadow rounded-md p-2">
          <p className="text-sm text-gray-500 mb-1">Sugestões:</p>
          <div className="flex flex-wrap gap-2">
            {cnpjSuggestions.map((cnpj, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200"
                onClick={() => setSearchTerm(cnpj)}
              >
                {cnpj}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-4">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter />
          Filtros
          {showFilters ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        <AnimatePresence>
          {showFilters && (
            <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black"
                onClick={() => setShowFilters(false)}
              />
              
              {/* Conteúdo do modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-md shadow-lg z-30 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white z-10 p-6 pb-0">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Filtros - {activeTab.toUpperCase()}</h3>
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 pt-0 space-y-6">
                  {/* Filtros para Geral */}
                  {activeTab === 'geral' && (
                    <>
                      <div className="space-y-4">
                        <h4 className="font-medium">Vagas:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Adulto Masculino</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="Mín"
                                value={filters.adultoMasc?.min ?? ''}
                                onChange={(e) => updateFilter('adultoMasc', {
                                  ...filters.adultoMasc,
                                  min: e.target.value ? Number(e.target.value) : undefined
                                })}
                              />
                              <input
                                type="number"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="Máx"
                                value={filters.adultoMasc?.max ?? ''}
                                onChange={(e) => updateFilter('adultoMasc', {
                                  ...filters.adultoMasc,
                                  max: e.target.value ? Number(e.target.value) : undefined
                                })}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Adulto Feminino</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="Mín"
                                value={filters.adultoFeminino?.min ?? ''}
                                onChange={(e) => updateFilter('adultoFeminino', {
                                  ...filters.adultoFeminino,
                                  min: e.target.value ? Number(e.target.value) : undefined
                                })}
                              />
                              <input
                                type="number"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="Máx"
                                value={filters.adultoFeminino?.max ?? ''}
                                onChange={(e) => updateFilter('adultoFeminino', {
                                  ...filters.adultoFeminino,
                                  max: e.target.value ? Number(e.target.value) : undefined
                                })}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Mães</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="Mín"
                                value={filters.maes?.min ?? ''}
                                onChange={(e) => updateFilter('maes', {
                                  ...filters.maes,
                                  min: e.target.value ? Number(e.target.value) : undefined
                                })}
                              />
                              <input
                                type="number"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="Máx"
                                value={filters.maes?.max ?? ''}
                                onChange={(e) => updateFilter('maes', {
                                  ...filters.maes,
                                  max: e.target.value ? Number(e.target.value) : undefined
                                })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">UF</label>
                          <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={filters.uf ?? ''}
                            onChange={(e) => updateFilter('uf', e.target.value || undefined)}
                          >
                            <option value="">Todos</option>
                            {filterOptions.uf.map((uf) => (
                              <option key={uf} value={uf}>{uf}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Cidade</label>
                          <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={filters.cidade ?? ''}
                            onChange={(e) => updateFilter('cidade', e.target.value || undefined)}
                            disabled={!filters.uf}
                          >
                            <option value="">Todos</option>
                            {filterOptions.cidade
                              .filter(cidade => {
                                if (!filters.uf) return true;
                                // Filtra cidades baseado na UF selecionada
                                const ufIndex = columnIndices['UF'];
                                const cidadeIndex = columnIndices['CIDADE'];
                                if (ufIndex === undefined || cidadeIndex === undefined) return false;
                                
                                return tableData.rows.some(row => 
                                  row[ufIndex] === filters.uf && row[cidadeIndex] === cidade
                                );
                              })
                              .map((cidade) => (
                                <option key={cidade} value={cidade}>{cidade}</option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Município</label>
                          <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={filters.municipio ?? ''}
                            onChange={(e) => updateFilter('municipio', e.target.value || undefined)}
                          >
                            <option value="">Todos</option>
                            {filterOptions.municipio.map((municipio) => (
                              <option key={municipio} value={municipio}>{municipio}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Data Vencimento</label>
                          <div className="flex gap-2">
                            <input
                              type="date"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              value={filters.dataVencimento?.from ?? ''}
                              onChange={(e) => updateFilter('dataVencimento', {
                                ...(filters.dataVencimento || {}),
                                from: e.target.value
                              })}
                            />
                            <input
                              type="date"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              value={filters.dataVencimento?.to ?? ''}
                              onChange={(e) => updateFilter('dataVencimento', {
                                ...(filters.dataVencimento || {}),
                                to: e.target.value
                              })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Data Inicial</label>
                          <div className="flex gap-2">
                            <input
                              type="date"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              value={filters.dataInicial?.from ?? ''}
                              onChange={(e) => updateFilter('dataInicial', {
                                ...(filters.dataInicial || {}),
                                from: e.target.value
                              })}
                            />
                            <input
                              type="date"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              value={filters.dataInicial?.to ?? ''}
                              onChange={(e) => updateFilter('dataInicial', {
                                ...(filters.dataInicial || {}),
                                to: e.target.value
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Filtros para CEBAS */}
                  {activeTab === 'cebas' && (
                    <>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Data Cronológica</label>
                        <div className="flex gap-2">
                          <input
                            type="date"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={filters.dataCronologica?.from ?? ''}
                            onChange={(e) => updateFilter('dataCronologica', {
                              ...(filters.dataCronologica || {}),
                              from: e.target.value
                            })}
                          />
                          <input
                            type="date"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={filters.dataCronologica?.to ?? ''}
                            onChange={(e) => updateFilter('dataCronologica', {
                              ...(filters.dataCronologica || {}),
                              to: e.target.value
                            })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Tipo de Processo</label>
                        <select
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          value={filters.tipoProcesso ?? ''}
                          onChange={(e) => updateFilter('tipoProcesso', 
                            e.target.value as 'convenio' | 'termo de fomento' || null
                          )}
                        >
                          <option value="">Todos</option>
                          <option value="Convênio">Convênio</option>
                          <option value="termo de fomento">Termo de Fomento</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Filtros para Repasses */}
                  {activeTab === 'repasses' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Contrapartida</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Mín"
                            value={filters.contrapartida?.min ?? ''}
                            onChange={(e) => updateFilter('contrapartida', {
                              ...filters.contrapartida,
                              min: e.target.value ? Number(e.target.value) : undefined
                            })}
                          />
                          <input
                            type="number"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Máx"
                            value={filters.contrapartida?.max ?? ''}
                            onChange={(e) => updateFilter('contrapartida', {
                              ...filters.contrapartida,
                              max: e.target.value ? Number(e.target.value) : undefined
                            })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">GND 3</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Mín"
                            value={filters.gnd3?.min ?? ''}
                            onChange={(e) => updateFilter('gnd3', {
                              ...filters.gnd3,
                              min: e.target.value ? Number(e.target.value) : undefined
                            })}
                          />
                          <input
                            type="number"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Máx"
                            value={filters.gnd3?.max ?? ''}
                            onChange={(e) => updateFilter('gnd3', {
                              ...filters.gnd3,
                              max: e.target.value ? Number(e.target.value) : undefined
                            })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">GND 4</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Mín"
                            value={filters.gnd4?.min ?? ''}
                            onChange={(e) => updateFilter('gnd4', {
                              ...filters.gnd4,
                              min: e.target.value ? Number(e.target.value) : undefined
                            })}
                          />
                          <input
                            type="number"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Máx"
                            value={filters.gnd4?.max ?? ''}
                            onChange={(e) => updateFilter('gnd4', {
                              ...filters.gnd4,
                              max: e.target.value ? Number(e.target.value) : undefined
                            })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Valor Total</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Mín"
                            value={filters.valorTotal?.min ?? ''}
                            onChange={(e) => updateFilter('valorTotal', {
                              ...filters.valorTotal,
                              min: e.target.value ? Number(e.target.value) : undefined
                            })}
                          />
                          <input
                            type="number"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Máx"
                            value={filters.valorTotal?.max ?? ''}
                            onChange={(e) => updateFilter('valorTotal', {
                              ...filters.valorTotal,
                              max: e.target.value ? Number(e.target.value) : undefined
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 sticky bottom-0 bg-white pb-4">
                    <button
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 mr-2"
                      onClick={() => setFilters({})}
                    >
                      Limpar Filtros
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={() => setShowFilters(false)}
                    >
                      Aplicar Filtros
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Conteúdo das tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeTab === 'geral' && (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Dados Gerais</h2>
            <div className="max-h-[600px] overflow-y-auto">
              {renderTable(finalData)}
            </div>
          </div>
        )}

        {activeTab === 'cebas' && (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">CEBAS</h2>
            <div className="max-h-[600px] overflow-y-auto">
              {renderTable(finalData)}
            </div>
          </div>
        )}

        {activeTab === 'repasses' && (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Repasses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-blue-50 p-4 rounded-lg shadow"
              >
                <h3 className="text-sm font-medium text-blue-800">Contrapartida</h3>
                <p className="text-2xl font-bold text-blue-600">{repassesTotals.contrapartida}</p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-green-50 p-4 rounded-lg shadow"
              >
                <h3 className="text-sm font-medium text-green-800">Valor GND 3</h3>
                <p className="text-2xl font-bold text-green-600">{repassesTotals.gnd3}</p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-purple-50 p-4 rounded-lg shadow"
              >
                <h3 className="text-sm font-medium text-purple-800">Valor GND 4</h3>
                <p className="text-2xl font-bold text-purple-600">{repassesTotals.gnd4}</p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-orange-50 p-4 rounded-lg shadow"
              >
                <h3 className="text-sm font-medium text-orange-800">Total Global</h3>
                <p className="text-2xl font-bold text-orange-600">{repassesTotals.totalGlobal}</p>
              </motion.div>
            </div>
            {finalData.length > 0 ? (
              <div className="max-h-[600px] overflow-y-auto">
                {renderTable(finalData)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum dado encontrado
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}