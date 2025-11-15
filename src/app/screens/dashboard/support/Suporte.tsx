import { useState } from 'react';
// o código abaixo é para referencias apenas, não utilizar na versão final

interface Solicitacao {
  id: number;
  titulo: string;
  descricao: string;
  tipoSuporte: string;
  quemPodeAjudar: string;
  servico: string;
  dataCriacao: string;
  ultimaAtualizacao: string;
  status: 'enviada' | 'andamento' | 'concluida' | 'recusada';
  tags: string[];
}

interface Filtro {
  key: string;
  label: string;
}

export default function Suporte(){
  const [filtroAtivo, setFiltroAtivo] = useState<string>('todas');
  
  const solicitações: Solicitacao[] = [
    {
      id: 1,
      titulo: "Problema com acesso ao sistema",
      descricao: "Não consigo acessar o módulo financeiro desde ontem à tarde. Aparece erro de autenticação.",
      tipoSuporte: "Problema técnico",
      quemPodeAjudar: "João",
      servico: "TI",
      dataCriacao: "15/11/2023",
      ultimaAtualizacao: "16/11/2023",
      status: "andamento",
      tags: ["TI", "Acesso"]
    },
    {
      id: 2,
      titulo: "Instalação de software",
      descricao: "Necessário instalar o Adobe Photoshop para o departamento de design.",
      tipoSuporte: "Instalação",
      quemPodeAjudar: "Daniel",
      servico: "TI",
      dataCriacao: "10/11/2023",
      ultimaAtualizacao: "12/11/2023",
      status: "concluida",
      tags: ["TI", "Instalação"]
    },
    {
      id: 3,
      titulo: "Manutenção de impressora",
      descricao: "Impressora do setor administrativo está com problema de papel encravado.",
      tipoSuporte: "Manutenção de hardware",
      quemPodeAjudar: "Luiz",
      servico: "Outros",
      dataCriacao: "08/11/2023",
      ultimaAtualizacao: "09/11/2023",
      status: "recusada",
      tags: ["Outros", "Manutenção"]
    },
    {
      id: 4,
      titulo: "Configuração de email",
      descricao: "Preciso configurar o email corporativo no meu celular novo.",
      tipoSuporte: "Configuração",
      quemPodeAjudar: "Cauã",
      servico: "TI",
      dataCriacao: "17/11/2023",
      ultimaAtualizacao: "17/11/2023",
      status: "enviada",
      tags: ["TI", "Configuração"]
    }
  ];

  const filtrarSolicitacoes = (): Solicitacao[] => {
    if (filtroAtivo === 'todas') {
      return solicitações;
    }
    return solicitações.filter(sol => sol.status === filtroAtivo);
  };

  const solicitaçõesFiltradas: Solicitacao[] = filtrarSolicitacoes();

  const getStatusInfo = (status: string) => {
    const statusMap = {
      enviada: { texto: 'Enviada', cor: 'bg-gray-500 text-white' },
      andamento: { texto: 'Em andamento', cor: 'bg-yellow-500 text-gray-900' },
      concluida: { texto: 'Concluída', cor: 'bg-green-500 text-gray-900' },
      recusada: { texto: 'Recusada', cor: 'bg-red-500 text-white' }
    };
    return statusMap[status as keyof typeof statusMap] || { texto: status, cor: 'bg-gray-500 text-white' };
  };

  const getTagColor = (tag: string): string => {
    const tagColors: { [key: string]: string } = {
      'TI': 'bg-blue-500 text-white',
      'Acesso': 'bg-purple-500 text-white',
      'Instalação': 'bg-green-500 text-white',
      'Outros': 'bg-orange-500 text-white',
      'Manutenção': 'bg-red-500 text-white',
      'Configuração': 'bg-indigo-500 text-white',
      'Hardware': 'bg-amber-500 text-white'
    };
    return tagColors[tag] || 'bg-gray-500 text-white';
  };

  const filtros: Filtro[] = [
    { key: 'todas', label: 'Todas as solicitações' },
    { key: 'enviada', label: 'Enviadas' },
    { key: 'recusada', label: 'Recusadas' },
    { key: 'andamento', label: 'Em andamento' },
    { key: 'concluida', label: 'Concluídas' }
  ];

  return(
    <section className="p-6 bg-gray-900 text-white min-h-screen">
      {/* Header com título e botão */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Chamadas ao suporte</h1>
          <p className="text-sm opacity-70">Faça chamadas a equipe de TI do Depad</p>
        </div>
        <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors border border-gray-600 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Chamado
        </button>
      </div>
      
      <div className="w-full h-px my-4 bg-gray-700"/>
      
      {/* Menu de Navegação */}
      <div className="flex items-center gap-1 p-1 bg-gray-800 rounded-lg w-fit mb-8">
        {filtros.map((filtro) => (
          <button 
            key={filtro.key}
            onClick={() => setFiltroAtivo(filtro.key)}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${filtroAtivo === filtro.key 
                ? 'bg-gray-700 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }
            `}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-400">
          <span className="font-semibold text-white">{solicitaçõesFiltradas.length}</span> solicitações
        </div>
        {filtroAtivo !== 'todas' && (
          <button 
            onClick={() => setFiltroAtivo('todas')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {/* Cards de solicitações filtradas */}
      <div className="grid gap-4 mb-6">
        {solicitaçõesFiltradas.length > 0 ? (
          solicitaçõesFiltradas.map((sol) => {
            const statusInfo = getStatusInfo(sol.status);
            return (
              <div key={sol.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-lg mb-2">{sol.titulo}</h3>
                    <div className="flex flex-wrap gap-2">
                      {sol.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className={`text-xs px-2 py-1 rounded ${getTagColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusInfo.cor}`}>
                    {statusInfo.texto}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-400">Tipo de suporte:</p>
                    <p className="text-white">{sol.tipoSuporte}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Quem pode ajudar:</p>
                    <p className="text-white">{sol.quemPodeAjudar}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Serviço:</p>
                    <p className="text-white">{sol.servico}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Data de criação:</p>
                    <p className="text-white">{sol.dataCriacao}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-3">{sol.descricao}</p>
                
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>ID: #{sol.id}</span>
                  <span>
                    {sol.status === 'concluida' ? `Concluído em: ${sol.ultimaAtualizacao}` :
                     sol.status === 'recusada' ? `Recusada em: ${sol.ultimaAtualizacao}` :
                     sol.status === 'andamento' ? `Última atualização: ${sol.ultimaAtualizacao}` :
                     'Aguardando análise'}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center">
            <p className="text-gray-400">Nenhuma solicitação encontrada</p>
          </div>
        )}
      </div>

      {/* Botão flutuante para adicionar (opcional - pode remover se quiser só o do header) */}
      <button className="fixed bottom-6 right-6 bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-full shadow-lg transition-colors border border-gray-600">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </section>
  );
}