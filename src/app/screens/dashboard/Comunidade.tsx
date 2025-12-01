import { useSearchParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useGeralData } from "~/hooks/dashboard/useGeralData";
import { Loader2, AlertCircle } from "lucide-react";

export default function Comunidade() {
  // ⚡ NO SPA MODE: Use useSearchParams() em vez de loader!
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  
  // Decodifica a query (seu exemplo: CTCBS%20-%20COMUNIDADE...)
  const decodedQuery = searchQuery ? decodeURIComponent(searchQuery) : "";
  
  console.log("🔍 Query raw:", searchQuery);
  console.log("🔍 Query decoded:", decodedQuery);
  console.log("🔍 Todos os params:", Object.fromEntries(searchParams.entries()));
  
  const navigate = useNavigate();
  
  // ⚡ Seus dados via hook
  const { data: allCommunities, isLoading, error } = useGeralData();
  
  // ⚡ Estados
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [similarCommunities, setSimilarCommunities] = useState<any[]>([]);
  const [isExactMatch, setIsExactMatch] = useState(false);
  
  // ⚡ DEBUG: Verifique se os dados estão chegando
  useEffect(() => {
    if (allCommunities) {
      console.log("✅ Dados carregados:", allCommunities.length, "comunidades");
      
      if (allCommunities.length > 0) {
        console.log("📊 Exemplo de dados:", {
          razao_social: allCommunities[0].razao_social,
          cnpj: allCommunities[0].cnpj,
          tem_razao_social: !!allCommunities[0].razao_social,
          tem_cnpj: !!allCommunities[0].cnpj
        });
        
        // Log das primeiras 5 comunidades para ver estrutura
        console.log("📋 Primeiras 5 comunidades:", 
          allCommunities.slice(0, 5).map(c => ({
            razao_social: c.razao_social?.substring(0, 30) + "...",
            cnpj: c.cnpj
          }))
        );
      }
    }
  }, [allCommunities]);
  
  // ⚡ Filtra comunidades com base na query
  useEffect(() => {
    console.log("🔄 Iniciando filtro...");
    console.log("Query:", decodedQuery);
    console.log("Dados disponíveis:", allCommunities?.length || 0);
    
    if (!allCommunities || allCommunities.length === 0) {
      console.log("❌ Sem dados para filtrar");
      setSelectedCommunity(null);
      setSimilarCommunities([]);
      setIsExactMatch(false);
      return;
    }
    
    if (!decodedQuery.trim()) {
      console.log("ℹ️ Query vazia");
      setSelectedCommunity(null);
      setSimilarCommunities([]);
      setIsExactMatch(false);
      return;
    }
    
    const query = decodedQuery.toLowerCase().trim();
    console.log("🔍 Buscando:", query);
    
    // 1. Tenta encontrar match EXATO
    const exactMatch = allCommunities.find(community => {
      const razaoSocial = (community.razao_social || "").toLowerCase();
      const cnpj = (community.cnpj || "").toString().toLowerCase();
      
      const isExact = razaoSocial === query || cnpj === query;
      
      if (isExact) {
        console.log("🎯 ENCONTRADO MATCH EXATO!");
        console.log("Comunidade:", community.razao_social);
      }
      
      return isExact;
    });
    
    if (exactMatch) {
      console.log("✅ Definindo comunidade exata:", exactMatch.razao_social);
      setSelectedCommunity(exactMatch);
      setSimilarCommunities([]);
      setIsExactMatch(true);
      return;
    }
    
    // 2. Busca similares (que CONTÉM a query)
    console.log("🔎 Buscando similares...");
    
    const similar = allCommunities.filter(community => {
      const razaoSocial = (community.razao_social || "").toLowerCase();
      const cnpj = (community.cnpj || "").toString().toLowerCase();
      
      const containsQuery = razaoSocial.includes(query) || cnpj.includes(query);
      
      if (containsQuery && razaoSocial) {
        console.log("📌 Similar encontrado:", razaoSocial.substring(0, 50));
      }
      
      return containsQuery;
    });
    
    console.log(`📊 Resultado: ${similar.length} similar(es) encontrado(s)`);
    
    // Ordena por relevância (começa com a query primeiro)
    similar.sort((a, b) => {
      const aName = (a.razao_social || "").toLowerCase();
      const bName = (b.razao_social || "").toLowerCase();
      
      // Prioriza os que começam com a query
      if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
      if (!aName.startsWith(query) && bName.startsWith(query)) return 1;
      
      // Depois ordena por tamanho do nome (mais curtos primeiro)
      return aName.length - bName.length;
    });
    
    setSelectedCommunity(null);
    setSimilarCommunities(similar.slice(0, 10)); // Limita a 10
    setIsExactMatch(false);
    
  }, [allCommunities, decodedQuery]);
  
  const handleSimilarClick = (community: any) => {
    const exactQuery = community.razao_social || community.cnpj;
    console.log("🖱️ Navegando para:", exactQuery);
    navigate(`/dashboard/comunidades?search=${encodeURIComponent(exactQuery)}`);
  };
  
  // ⚡ Renderização condicional
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando dados das comunidades...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }
  
  console.log("🎨 Renderizando com:", {
    query: decodedQuery,
    hasSelected: !!selectedCommunity,
    similars: similarCommunities.length,
    totalCommunities: allCommunities?.length || 0
  });
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {decodedQuery ? `Busca: "${decodedQuery}"` : "Comunidades"}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {!decodedQuery 
            ? "Use a barra de pesquisa no topo para buscar comunidades"
            : isExactMatch 
              ? "✓ Encontrada correspondência exata"
              : similarCommunities.length > 0 
                ? `📋 ${similarCommunities.length} resultado(s) encontrado(s)`
                : "❌ Nenhum resultado encontrado"
          }
        </p>
      </div>
      
      {/* Conteúdo principal */}
      <div className="space-y-8">
        
        {/* SE ENCONTROU COMUNIDADE EXATA */}
        {selectedCommunity && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-green-200 dark:border-green-900">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium mb-3">
                  ✓ Correspondência exata
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedCommunity.razao_social}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  CNPJ: {selectedCommunity.cnpj}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Informações básicas */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Informações Gerais</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Nome Fantasia:</span>
                    <p className="font-medium">{selectedCommunity.nome_fantasia || "Não informado"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Localização:</span>
                    <p className="font-medium">{selectedCommunity.municipio || "N/I"} - {selectedCommunity.uf || "N/I"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Contrato:</span>
                    <p className="font-medium">{selectedCommunity.contrato_ano || "N/I"}</p>
                  </div>
                </div>
              </div>
              
              {/* Vagas */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Vagas Contratadas</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-bold text-blue-600">{selectedCommunity.vagas_contratadas || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Masculino:</span>
                    <span>{selectedCommunity.adulto_masc || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Feminino:</span>
                    <span>{selectedCommunity.adulto_feminino || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mães:</span>
                    <span>{selectedCommunity.maes || 0}</span>
                  </div>
                </div>
              </div>
              
              {/* Contato */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Contato</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Telefone:</span>
                    <p className="font-medium">{selectedCommunity.telefone || "Não informado"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                    <p className="font-medium">{selectedCommunity.email || "Não informado"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Endereço:</span>
                    <p className="font-medium">{selectedCommunity.endereco || "Não informado"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recursos Financeiros */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recursos Financeiros</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Previsão Anual</p>
                  <p className="text-xl font-bold text-green-600">
                    {selectedCommunity.previsao_recurso_anual || "Não informado"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Previsão Mensal</p>
                  <p className="text-xl font-bold text-blue-600">
                    {selectedCommunity.previsao_recurso_mensal || "Não informado"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* SE NÃO ENCONTROU EXATO, MOSTRA LISTA DE SIMILARES */}
        {!selectedCommunity && similarCommunities.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Resultados da busca
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Clique em uma comunidade para ver detalhes completos
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                {similarCommunities.length} resultado(s)
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarCommunities.map((community, index) => (
                <div 
                  key={`${community.cnpj || community.razao_social}-${index}`}
                  onClick={() => handleSimilarClick(community)}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 
                           hover:border-blue-500 dark:hover:border-blue-500 
                           hover:bg-blue-50 dark:hover:bg-blue-900/20 
                           cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {community.razao_social || "Nome não disponível"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        CNPJ: {community.cnpj || "Não informado"}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 
                                    flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-300 font-bold">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Local:</span>
                      <span className="font-medium">{community.municipio || "N/I"} - {community.uf || "N/I"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Vagas:</span>
                      <span className="font-bold text-blue-600">{community.vagas_contratadas || 0}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Clique para ver detalhes →
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* SE NÃO ENCONTROU NADA */}
        {decodedQuery && !selectedCommunity && similarCommunities.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Busca por: "<strong>{decodedQuery}</strong>"
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Verifique a ortografia do nome</p>
                <p>• Tente buscar por parte do nome</p>
                <p>• Ou busque pelo CNPJ completo</p>
              </div>
            </div>
          </div>
        )}
        
        {/* SE NÃO HÁ BUSCA */}
        {!decodedQuery && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 
                        rounded-xl shadow-lg p-8 text-center">
            <div className="max-w-lg mx-auto">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Faça uma busca
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Use a barra de pesquisa no topo da página para buscar por comunidades terapêuticas.
              </p>
              <div className="inline-flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="px-3 py-2 bg-white dark:bg-gray-800 rounded-lg">
                  Exemplo: "CTCBS - COMUNIDADE TERAPÊUTICA COLÔNIA BOM SAMARITANO"
                </span>
                <span className="px-3 py-2 bg-white dark:bg-gray-800 rounded-lg">
                  Ou busque por CNPJ: 00.000.000/0001-00
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}