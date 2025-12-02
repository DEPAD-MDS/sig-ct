import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles, Download, AlertCircle } from "lucide-react";

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

interface PresentationResponse {
  text: string;
  status: string;
  error?: string;
}

export default function PresentationModal({ isOpen, onClose, data }: PresentationModalProps) {
  const [step, setStep] = useState<'input' | 'loading' | 'result' | 'error'>('input');
  const [description, setDescription] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const captureGraphs = async () => {
    const captures: string[] = [];
    try {
      const canvases = document.querySelectorAll('canvas');
      for (const canvas of Array.from(canvases)) {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          captures.push(dataUrl);
        } catch (error) {
          console.error('Erro ao capturar canvas:', error);
        }
      }
      return captures;
    } catch (error) {
      console.error('Erro geral ao capturar gráficos:', error);
      return [];
    }
  };

  const handleGenerate = async () => {
    setStep('loading');
    setError('');
    setIsGenerating(true);
    
    try {
      // Pequeno delay para garantir que o modal está fechado
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Capturar os gráficos
      const graphs = await captureGraphs();
      
      // Preparar payload para API
      const payload = {
        description: description,
        dashboardData: data,
        metadata: {
          generatedAt: new Date().toISOString(),
          totalScreenshots: graphs.length
        }
      };

      console.log('Enviando para API:', { 
        ...payload, 
        screenshots: `${graphs.length} imagens` 
      });

      // Chamar a API
      const response = await fetch(import.meta.env.VITE_API_ENDPOINT +'/relator/presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const result: PresentationResponse = await response.json();
      
      if (result.error || result.status === 'error') {
        throw new Error(result.error || 'Erro ao processar apresentação');
      }

      // Atualizar estado com os resultados
      setGeneratedText(result.text || `Apresentação gerada com base em: "${description}"`);
      setScreenshots(graphs);
      setStep('result');

    } catch (error: any) {
      console.error('Erro:', error);
      setError(error.message || 'Ocorreu um erro ao gerar a apresentação.');
      setStep('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setDescription('');
    setGeneratedText('');
    setScreenshots([]);
    setError('');
    setIsGenerating(false);
  };

  const handleClose = () => {
    if (!isGenerating) {
      handleReset();
      onClose();
    }
  };

  const handleDownloadAll = () => {
    screenshots.forEach((screenshot, index) => {
      const link = document.createElement('a');
      link.href = screenshot;
      link.download = `grafico-dashboard-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleDownloadSingle = (screenshot: string, index: number) => {
    const link = document.createElement('a');
    link.href = screenshot;
    link.download = `grafico-dashboard-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRetry = () => {
    setStep('input');
    setError('');
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-xl bg-gray-800 border border-gray-700 p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <AnimatePresence mode="wait">
              {step === 'input' && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Criar Apresentação</h2>
                    <button
                      onClick={handleClose}
                      disabled={isGenerating}
                      className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <p className="text-gray-300 mb-4">
                    Conte mais sobre o que você deseja apresentar nessa sessão do dashboard
                  </p>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Análise de distribuição de comunidades por região..."
                    className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                    disabled={isGenerating}
                  />

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleClose}
                      disabled={isGenerating}
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-650 transition-all disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={!description.trim() || isGenerating}
                      className="flex-1 px-4 py-2 bg-blue-600 border border-blue-500 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Gerar Apresentação'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Gerando sua apresentação</h3>
                  <p className="text-sm text-gray-400">Analisando dados e criando conteúdo...</p>
                </motion.div>
              )}

              {step === 'result' && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Sparkles className="text-yellow-500" size={20} />
                      Apresentação Gerada!
                    </h2>
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                      {generatedText}
                    </p>
                  </div>

                  {screenshots.length > 0 ? (
                    <>
                      <div className="bg-gray-750 border border-gray-600 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold">
                            {screenshots.length} gráfico(s) capturado(s)
                          </h3>
                          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                            PNG • Alta qualidade
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                          {screenshots.map((screenshot, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.08 }}
                              className="bg-gray-700 rounded-lg overflow-hidden border border-gray-600 relative group"
                            >
                              <img 
                                src={screenshot} 
                                alt={`Gráfico ${i + 1}`}
                                className="w-full h-auto"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  onClick={() => handleDownloadSingle(screenshot, i)}
                                  className="px-4 py-2 bg-blue-600 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors"
                                >
                                  <Download size={16} />
                                  Baixar
                                </button>
                              </div>
                              <div className="p-2 bg-gray-750">
                                <p className="text-xs text-center text-gray-300">Gráfico {i + 1}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleReset}
                          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-650 transition-all"
                        >
                          Nova Apresentação
                        </button>
                        <button
                          onClick={handleDownloadAll}
                          className="flex-1 px-4 py-2 bg-green-600 border border-green-500 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={16} />
                          Baixar Todos ({screenshots.length})
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 text-center">
                      <div className="text-yellow-500 mb-2">⚠️</div>
                      <p className="text-sm text-yellow-200 mb-4">
                        Nenhum gráfico foi encontrado na página.
                      </p>
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-650 transition-all"
                      >
                        Nova Apresentação
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 text-center">Erro ao gerar apresentação</h3>
                  
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 w-full">
                    <p className="text-sm text-red-200 text-center">{error}</p>
                  </div>

                  <div className="flex gap-3 w-full">
                    <button
                      onClick={handleRetry}
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-650 transition-all"
                    >
                      Tentar Novamente
                    </button>
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-2 bg-blue-600 border border-blue-500 rounded-lg hover:bg-blue-700 transition-all"
                    >
                      Fechar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}