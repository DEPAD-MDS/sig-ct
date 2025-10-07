import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Users, UserCheck, Baby, Building, Calendar, ArrowLeft, Filter, X } from 'lucide-react';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from 'msalConfig';

// Importações do Leaflet
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para ícones padrão do Leaflet em React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Comunidade {
  id: number;
  CNPJ: string;
  "RAZÃO SOCIAL": string;
  "NOME FANTASIA": string | null;
  "CONTRATO/ANO": string | null;
  UF: string;
  MUNICIPIO: string;
  "ENDEREÇO": string | null;
  TELEFONE: string | null;
  EMAIL: string | null;
  "VAGAS CONTRATADAS": number | null;
  "ADULTO MASC": number | null;
  "ADULTO FEMININO": number | null;
  "MÃES": number | null;
  "PREVISÃO DE RECURSO FINACEIRO/ANO": number | null;
  "PREVISÃO DE RECURSO FINACEIRO/MENSAL": number | null;
  "DATA INICIAL CT": string | null;
  "DATA VENCIMENTO CT": string | null;
  LATITUDE: number;
  LONGITUDE: number;
}

// Hook personalizado para obter access token
function useAccessToken() {
  const { instance, accounts } = useMsal();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const acquireToken = async () => {
      if (accounts.length === 0) {
        setError("Nenhum usuário autenticado");
        return;
      }

      try {
        const response = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0]
        });
        setToken(response.accessToken);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Erro ao obter token");
      }
    };

    acquireToken();
  }, [instance, accounts]);

  return { token, error };
}

export default function Geral() {
  // Estados principais
  const [viewMode, setViewMode] = useState<'dashboard' | 'search' | 'detail'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<Comunidade[]>([]);
  const [filteredData, setFilteredData] = useState<Comunidade[]>([]);
  const [searchResults, setSearchResults] = useState<Comunidade[]>([]);
  const [selectedComunidade, setSelectedComunidade] = useState<Comunidade | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados do mapa
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  
  // Estados dos filtros
  const [filters, setFilters] = useState({
    uf: 'all',
    municipio: 'all',
    vagasMin: '',
    vagasMax: '',
    maesMin: '',
    maesMax: '',
    mascMin: '',
    mascMax: '',
    femMin: '',
    femMax: '',
    sortVencimento: 'none'
  });

  // Token de acesso
  const { token, error } = useAccessToken();

  // Função para fazer requisições autenticadas
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error("Token não disponível");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return response;
  };

  // Carregar dados gerais
  const fetchData = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetchWithAuth('http://127.0.0.1:8000/api/data/geral/');
      const result = await response.json();
      setData(result.data || []);
      setFilteredData(result.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setData([]);
      setFilteredData([]);
    }
    setLoading(false);
  };

  // Carregar dados quando token estiver disponível
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Buscar comunidade específica
  const handleSearch = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim() && token) {
      setLoading(true);
      try {
        const response = await fetchWithAuth(`http://127.0.0.1:8000/api/data/geral/filter?name=${encodeURIComponent(searchQuery)}`);
        const result = await response.json();
        const searchData = result.data || [];
        
        if (searchData.length === 1) {
          setSelectedComunidade(searchData[0]);
          setViewMode('detail');
        } else if (searchData.length > 1) {
          setSearchResults(searchData);
          setViewMode('search');
        } else {
          setSearchResults([]);
          setViewMode('search');
        }
      } catch (error) {
        console.error('Erro na busca:', error);
        setSearchResults([]);
        setViewMode('search');
      }
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...data];

    if (filters.uf !== 'all') {
      filtered = filtered.filter(item => item.UF === filters.uf);
    }

    if (filters.municipio !== 'all') {
      filtered = filtered.filter(item => item.MUNICIPIO === filters.municipio);
    }

    if (filters.vagasMin) {
      filtered = filtered.filter(item => (item["VAGAS CONTRATADAS"] || 0) >= parseInt(filters.vagasMin));
    }
    if (filters.vagasMax) {
      filtered = filtered.filter(item => (item["VAGAS CONTRATADAS"] || 0) <= parseInt(filters.vagasMax));
    }

    if (filters.maesMin) {
      filtered = filtered.filter(item => (item["MÃES"] || 0) >= parseInt(filters.maesMin));
    }
    if (filters.maesMax) {
      filtered = filtered.filter(item => (item["MÃES"] || 0) <= parseInt(filters.maesMax));
    }

    if (filters.mascMin) {
      filtered = filtered.filter(item => (item["ADULTO MASC"] || 0) >= parseInt(filters.mascMin));
    }
    if (filters.mascMax) {
      filtered = filtered.filter(item => (item["ADULTO MASC"] || 0) <= parseInt(filters.mascMax));
    }

    if (filters.femMin) {
      filtered = filtered.filter(item => (item["ADULTO FEMININO"] || 0) >= parseInt(filters.femMin));
    }
    if (filters.femMax) {
      filtered = filtered.filter(item => (item["ADULTO FEMININO"] || 0) <= parseInt(filters.femMax));
    }

    if (filters.sortVencimento === 'asc') {
      filtered.sort((a, b) => {
        const dateA = a["DATA VENCIMENTO CT"] ? new Date(a["DATA VENCIMENTO CT"]).getTime() : Infinity;
        const dateB = b["DATA VENCIMENTO CT"] ? new Date(b["DATA VENCIMENTO CT"]).getTime() : Infinity;
        return dateA - dateB;
      });
    } else if (filters.sortVencimento === 'desc') {
      filtered.sort((a, b) => {
        const dateA = a["DATA VENCIMENTO CT"] ? new Date(a["DATA VENCIMENTO CT"]).getTime() : -Infinity;
        const dateB = b["DATA VENCIMENTO CT"] ? new Date(b["DATA VENCIMENTO CT"]).getTime() : -Infinity;
        return dateB - dateA;
      });
    }

    setFilteredData(filtered);
  }, [filters, data]);

  // Inicializar mapa Leaflet
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current || viewMode !== 'dashboard') return;

    // Criar mapa
    const map = L.map(mapRef.current, {
      center: [-15, -52],
      zoom: 4,
      minZoom: 3,
      maxZoom: 15,
      zoomControl: true
    });

    // Adicionar tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      className: 'map-tiles'
    }).addTo(map);

    // Aplicar estilo aos tiles
    const style = document.createElement('style');
    style.textContent = `
      .map-tiles { 
        filter: grayscale(100%) contrast(1.2) brightness(0.8); 
      }
      .leaflet-popup-content-wrapper {
        background: #1e293b;
        color: white;
        border-radius: 8px;
      }
      .leaflet-popup-tip {
        background: #1e293b;
      }
    `;
    document.head.appendChild(style);

    // Criar layer group para os marcadores
    markersLayerRef.current = L.layerGroup().addTo(map);
    leafletMapRef.current = map;

    // Forçar redimensionamento do mapa
    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, [viewMode]);

  // Atualizar marcadores no mapa
  useEffect(() => {
    if (!leafletMapRef.current || !markersLayerRef.current || filteredData.length === 0) return;
    
    // Limpar marcadores existentes
    markersLayerRef.current.clearLayers();

    // Adicionar novos marcadores
    filteredData.forEach(item => {
      // Verificar se tem coordenadas válidas
      if (item.LATITUDE && item.LONGITUDE && 
          !isNaN(item.LATITUDE) && !isNaN(item.LONGITUDE) &&
          Math.abs(item.LATITUDE) <= 90 && Math.abs(item.LONGITUDE) <= 180) {
        
        try {
          // Criar marcador com ícone personalizado
          const marker = L.marker([item.LATITUDE, item.LONGITUDE], {
            icon: L.divIcon({
              className: 'custom-marker',
              html: `
                <div style="
                  background: #3b82f6; 
                  width: 20px; 
                  height: 20px; 
                  border-radius: 50%; 
                  border: 3px solid #1e40af;
                  cursor: pointer;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                "></div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })
          });

          // Criar popup com informações
          const popupContent = `
            <div style="font-family: system-ui; min-width: 200px; padding: 8px;">
              <strong style="color: #f1f5f9; font-size: 14px; display: block; margin-bottom: 8px;">
                ${item["RAZÃO SOCIAL"]}
              </strong>
              <div style="color: #cbd5e1; font-size: 12px; margin-bottom: 4px;">
                📍 ${item.MUNICIPIO}, ${item.UF}
              </div>
              <div style="color: #cbd5e1; font-size: 12px; margin-bottom: 4px;">
                👥 Vagas: ${item["VAGAS CONTRATADAS"] || 'N/A'}
              </div>
              <div style="color: #cbd5e1; font-size: 12px; margin-bottom: 4px;">
                🚹 Masculino: ${item["ADULTO MASC"] || 'N/A'}
              </div>
              <div style="color: #cbd5e1; font-size: 12px; margin-bottom: 4px;">
                🚺 Feminino: ${item["ADULTO FEMININO"] || 'N/A'}
              </div>
              <div style="color: #cbd5e1; font-size: 12px;">
                👶 Mães: ${item["MÃES"] || 'N/A'}
              </div>
              <button onclick="window.detailView && window.detailView(${item.id})" 
                style="
                  background: #3b82f6; 
                  color: white; 
                  border: none; 
                  padding: 6px 12px; 
                  border-radius: 4px; 
                  cursor: pointer; 
                  margin-top: 8px; 
                  font-size: 12px;
                  width: 100%;
                ">
                Ver Detalhes
              </button>
            </div>
          `;

          marker.bindPopup(popupContent);

          // Adicionar evento de clique para abrir detalhes
          marker.on('click', () => {
            setSelectedComunidade(item);
            setViewMode('detail');
          });

          marker.addTo(markersLayerRef.current);
        } catch (error) {
          console.warn('Erro ao criar marcador para:', item["RAZÃO SOCIAL"], error);
        }
      } else {
        console.warn('Coordenadas inválidas para:', item["RAZÃO SOCIAL"], item.LATITUDE, item.LONGITUDE);
      }
    });

    // Ajustar view do mapa para mostrar todos os marcadores se houver dados
    if (filteredData.length > 0) {
      const validMarkers = filteredData.filter(item => 
        item.LATITUDE && item.LONGITUDE && 
        !isNaN(item.LATITUDE) && !isNaN(item.LONGITUDE)
      );

      if (validMarkers.length > 0) {
        const group = L.featureGroup(
          validMarkers.map(item => 
            L.marker([item.LATITUDE, item.LONGITUDE])
          )
        );
        leafletMapRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [filteredData]);

  // Expor função para o popup
  useEffect(() => {
    (window as any).detailView = (id: number) => {
      const comunidade = data.find(item => item.id === id);
      if (comunidade) {
        setSelectedComunidade(comunidade);
        setViewMode('detail');
      }
    };

    return () => {
      (window as any).detailView = null;
    };
  }, [data]);

  // Obter listas únicas para filtros
  const ufs = Array.from(new Set(data.map(item => item.UF))).sort();
  const municipios = filters.uf === 'all' 
    ? Array.from(new Set(data.map(item => item.MUNICIPIO))).sort()
    : Array.from(new Set(data.filter(item => item.UF === filters.uf).map(item => item.MUNICIPIO))).sort();

  // Calcular estatísticas
  const stats = {
    totalEntidades: filteredData.length,
    totalVagas: filteredData.reduce((sum, item) => sum + (item["VAGAS CONTRATADAS"] || 0), 0),
    totalMasc: filteredData.reduce((sum, item) => sum + (item["ADULTO MASC"] || 0), 0),
    totalFem: filteredData.reduce((sum, item) => sum + (item["ADULTO FEMININO"] || 0), 0),
    totalMaes: filteredData.reduce((sum, item) => sum + (item["MÃES"] || 0), 0)
  };

  // Se houver erro de autenticação
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 p-6 flex items-center justify-center">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center max-w-md">
          <div className="text-red-400 text-lg mb-4">Erro de Autenticação</div>
          <div className="text-slate-400 mb-4">{error}</div>
          <div className="text-slate-500 text-sm">Por favor, faça login novamente.</div>
        </div>
      </div>
    );
  }

  // Se ainda estiver carregando o token
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 p-6 flex items-center justify-center">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
          <div className="text-blue-400 text-lg mb-4">Obtendo token de acesso...</div>
          <div className="text-slate-400">Aguarde enquanto configuramos sua sessão.</div>
        </div>
      </div>
    );
  }

  // [Restante do código permanece igual...]
  // ... (manter todas as outras funções e renderizações como estão)

  // Renderizar view de detalhes
  if (viewMode === 'detail' && selectedComunidade) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => {
              setViewMode('dashboard');
              setSelectedComunidade(null);
              setSearchQuery('');
            }}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
          >
            <ArrowLeft size={20} />
            Voltar ao Dashboard
          </button>

          <h1 className="text-3xl font-bold text-white mb-8">{selectedComunidade["RAZÃO SOCIAL"]}</h1>
            
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <Users className="text-blue-400" size={24} />
                <div>
                  <div className="text-xs text-slate-400">Total de Vagas</div>
                  <div className="text-xl font-semibold text-white">
                    {selectedComunidade["VAGAS CONTRATADAS"] || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <UserCheck className="text-green-400" size={24} />
                <div>
                  <div className="text-xs text-slate-400">Adulto Masculino</div>
                  <div className="text-xl font-semibold text-white">
                    {selectedComunidade["ADULTO MASC"] || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <UserCheck className="text-pink-400" size={24} />
                <div>
                  <div className="text-xs text-slate-400">Adulto Feminino</div>
                  <div className="text-xl font-semibold text-white">
                    {selectedComunidade["ADULTO FEMININO"] || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <Baby className="text-purple-400" size={24} />
                <div>
                  <div className="text-xs text-slate-400">Mães Nutrizes</div>
                  <div className="text-xl font-semibold text-white">
                    {selectedComunidade["MÃES"] || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-orange-400" size={24} />
                <div>
                  <div className="text-xs text-slate-400">Vencimento</div>
                  <div className="text-sm font-semibold text-white">
                    {selectedComunidade["DATA VENCIMENTO CT"] || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Informações Básicas</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 text-sm">CNPJ:</span>
                  <p className="text-white">{selectedComunidade.CNPJ}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Nome Fantasia:</span>
                  <p className="text-white">{selectedComunidade["NOME FANTASIA"] || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Contrato/Ano:</span>
                  <p className="text-white">{selectedComunidade["CONTRATO/ANO"] || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Localização:</span>
                  <p className="text-white">{selectedComunidade.MUNICIPIO}, {selectedComunidade.UF}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contato</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 text-sm">Endereço:</span>
                  <p className="text-white">{selectedComunidade["ENDEREÇO"] || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Telefone:</span>
                  <p className="text-white">{selectedComunidade.TELEFONE || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Email:</span>
                  <p className="text-white">{selectedComunidade.EMAIL || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recursos Financeiros</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 text-sm">Previsão Anual:</span>
                  <p className="text-white">
                    {selectedComunidade["PREVISÃO DE RECURSO FINACEIRO/ANO"] 
                      ? `R$ ${selectedComunidade["PREVISÃO DE RECURSO FINACEIRO/ANO"].toLocaleString('pt-BR', {minimumFractionDigits: 2})}` 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Previsão Mensal:</span>
                  <p className="text-white">
                    {selectedComunidade["PREVISÃO DE RECURSO FINACEIRO/MENSAL"] 
                      ? `R$ ${selectedComunidade["PREVISÃO DE RECURSO FINACEIRO/MENSAL"].toLocaleString('pt-BR', {minimumFractionDigits: 2})}` 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Datas do Contrato</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 text-sm">Data Inicial:</span>
                  <p className="text-white">{selectedComunidade["DATA INICIAL CT"] || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Data de Vencimento:</span>
                  <p className="text-white">{selectedComunidade["DATA VENCIMENTO CT"] || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar view de busca
  if (viewMode === 'search') {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => {
              setViewMode('dashboard');
              setSearchResults([]);
              setSearchQuery('');
            }}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
          >
            <ArrowLeft size={20} />
            Voltar ao Dashboard
          </button>

          <h1 className="text-2xl font-bold text-white mb-6">
            Resultados da busca: "{searchQuery}"
          </h1>

          {searchResults.length === 0 ? (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
              <p className="text-slate-400">Nenhuma comunidade encontrada com esse nome.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map(comunidade => (
                <div
                  key={comunidade.id}
                  onClick={() => {
                    setSelectedComunidade(comunidade);
                    setViewMode('detail');
                  }}
                  className="bg-slate-800 rounded-lg border border-slate-700 p-6 cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <h3 className="font-semibold text-white mb-2 text-sm">
                    {comunidade["RAZÃO SOCIAL"]}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-400">
                      <span className="text-slate-500">Local:</span> {comunidade.MUNICIPIO}, {comunidade.UF}
                    </p>
                    <p className="text-slate-400">
                      <span className="text-slate-500">CNPJ:</span> {comunidade.CNPJ}
                    </p>
                    <p className="text-slate-400">
                      <span className="text-slate-500">Vagas:</span> {comunidade["VAGAS CONTRATADAS"] || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Renderizar dashboard principal
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Dashboard Geral</h1>
          
          {/* Barra de pesquisa */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              placeholder="Pesquisar comunidade por nome..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          </div>
        </div>

        {/* Botão de filtros */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-700"
          >
            <Filter size={18} />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>

        {/* Painel de filtros */}
        {showFilters && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">UF</label>
                <select
                  value={filters.uf}
                  onChange={(e) => setFilters({...filters, uf: e.target.value, municipio: 'all'})}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                >
                  <option value="all">Todos</option>
                  {ufs.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Município</label>
                <select
                  value={filters.municipio}
                  onChange={(e) => setFilters({...filters, municipio: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                  disabled={filters.uf === 'all'}
                >
                  <option value="all">Todos</option>
                  {municipios.map(mun => (
                    <option key={mun} value={mun}>{mun}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Vagas Min</label>
                <input
                  type="number"
                  value={filters.vagasMin}
                  onChange={(e) => setFilters({...filters, vagasMin: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Vagas Max</label>
                <input
                  type="number"
                  value={filters.vagasMax}
                  onChange={(e) => setFilters({...filters, vagasMax: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                  placeholder="999"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Masculino Min</label>
                <input
                  type="number"
                  value={filters.mascMin}
                  onChange={(e) => setFilters({...filters, mascMin: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Masculino Max</label>
                <input
                  type="number"
                  value={filters.mascMax}
                  onChange={(e) => setFilters({...filters, mascMax: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                  placeholder="999"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Feminino Min</label>
                <input
                  type="number"
                  value={filters.femMin}
                  onChange={(e) => setFilters({...filters, femMin: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Feminino Max</label>
                <input
                  type="number"
                  value={filters.femMax}
                  onChange={(e) => setFilters({...filters, femMax: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                  placeholder="999"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Mães Min</label>
                <input
                  type="number"
                  value={filters.maesMin}
                  onChange={(e) => setFilters({...filters, maesMin: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Mães Max</label>
                <input
                  type="number"
                  value={filters.maesMax}
                  onChange={(e) => setFilters({...filters, maesMax: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                  placeholder="999"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Ordenar Vencimento</label>
                <select
                  value={filters.sortVencimento}
                  onChange={(e) => setFilters({...filters, sortVencimento: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                >
                  <option value="none">Sem ordenação</option>
                  <option value="asc">Mais próximo</option>
                  <option value="desc">Mais distante</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setFilters({
                uf: 'all',
                municipio: 'all',
                vagasMin: '',
                vagasMax: '',
                maesMin: '',
                maesMax: '',
                mascMin: '',
                mascMax: '',
                femMin: '',
                femMax: '',
                sortVencimento: 'none'
              })}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
            >
              Limpar Filtros
            </button>
          </div>
        )}

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <Building className="text-blue-400" size={24} />
              <div>
                <div className="text-xs text-slate-400">Total Entidades</div>
                <div className="text-2xl font-bold text-white">{stats.totalEntidades}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <Users className="text-green-400" size={24} />
              <div>
                <div className="text-xs text-slate-400">Total Vagas</div>
                <div className="text-2xl font-bold text-white">{stats.totalVagas}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="text-cyan-400" size={24} />
              <div>
                <div className="text-xs text-slate-400">Adulto Masculino</div>
                <div className="text-2xl font-bold text-white">{stats.totalMasc}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="text-pink-400" size={24} />
              <div>
                <div className="text-xs text-slate-400">Adulto Feminino</div>
                <div className="text-2xl font-bold text-white">{stats.totalFem}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <Baby className="text-purple-400" size={24} />
              <div>
                <div className="text-xs text-slate-400">Mães Nutrizes</div>
                <div className="text-2xl font-bold text-white">{stats.totalMaes}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-8">
          <div 
            ref={mapRef} 
            style={{ 
              width: '100%', 
              height: '500px',
              background: '#0f172a'
            }}
          />
        </div>

        {/* Tabela de dados */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Dados Detalhados</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-slate-400">Carregando dados...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Razão Social</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">UF</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Município</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Vagas</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Masc</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Fem</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Mães</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Vencimento</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredData.slice(0, 50).map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-700 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedComunidade(item);
                        setViewMode('detail');
                      }}
                    >
                      <td className="px-4 py-3 text-sm text-white font-medium">
                        {item["RAZÃO SOCIAL"]}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{item.UF}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{item.MUNICIPIO}</td>
                      <td className="px-4 py-3 text-sm text-slate-300 text-center">
                        {item["VAGAS CONTRATADAS"] || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300 text-center">
                        {item["ADULTO MASC"] || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300 text-center">
                        {item["ADULTO FEMININO"] || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300 text-center">
                        {item["MÃES"] || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {item["DATA VENCIMENTO CT"] || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {item.EMAIL || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredData.length > 50 && (
                <div className="px-6 py-3 bg-slate-900 text-center text-sm text-slate-400">
                  Mostrando 50 de {filteredData.length} registros
                </div>
              )}
              
              {filteredData.length === 0 && (
                <div className="px-6 py-8 text-center text-slate-400">
                  Nenhum registro encontrado com os filtros aplicados.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}