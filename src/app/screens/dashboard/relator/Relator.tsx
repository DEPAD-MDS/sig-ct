import { ArrowUp } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEEPSEEK_API_KEY = String(import.meta.env.VITE_IA_TOKEN);
const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function Relator() {
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );
  const [rawData, setRawData] = useState<string>("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Função para converter markdown simples para HTML
  const formatMarkdown = useCallback((text: string): string => {
    if (!text) return "";

    let html = text.replace(/\\n/g, "\n").replace(/\n/g, "<br/>");

    // Negrito
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold">$1</strong>'
    );
    html = html.replace(/__(.*?)__/g, '<strong class="font-bold">$1</strong>');

    // Itálico
    html = html.replace(/\*(?!\*)(.*?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/_(?!_)(.*?)_/g, '<em class="italic">$1</em>');

    return html;
  }, []);

  // Componente para renderizar markdown
  const MarkdownRenderer = ({ content }: { content: string }) => {
    const formattedHtml = formatMarkdown(content);
    return (
      <div
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: formattedHtml }}
      />
    );
  };

  // Carregar dados do TXT no public
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);

        // Lê o arquivo TXT do diretório public
        const response = await fetch("/dados/depad.txt");

        if (!response.ok) {
          throw new Error(`Erro ao carregar dados: ${response.status}`);
        }

        const text = await response.text();
        setRawData(text);
        console.log("✅ Dados carregados do TXT:", text.length, "caracteres");
      } catch (error: any) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Scroll para baixo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessageId]);

  // Função para chamar a API da DeepSeek com streaming
  const callDeepSeekAPI = useCallback(
    async (
      userMessage: string,
      conversationHistory: any[],
      onChunk: (chunk: string) => void,
      onComplete: (fullText: string) => void
    ) => {
      try {
        // Cancelar requisição anterior se existir
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        const messages = [
          {
            role: "system",
            content: `Você é um assistente do Depad/MDS. Seu nome é Relator. As vezes se alguém te enviar uma brincadeirinha, responda em tom de brincadeira também
            Quando for listar algum dado, use listas numeradas ou com marcadores para facilitar a leitura, não tente simular td em parágrafos corridos.
            Ao escrever o relatório, use linguagem formal e clara, adequada para o contexto institucional do MDS.
            AQUI ESTÃO OS DADOS (em formato JSON):
            ${rawData}
            Use APENAS esses dados em toon para responder. Se não tiver a informação nos dados, diga que não tem.`,
          },
          ...conversationHistory.filter((msg) => msg.role !== "system"),
          {
            role: "user",
            content: userMessage,
          },
        ];

        const response = await fetch(DEEPSEEK_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 2000,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk
              .split("\n")
              .filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  onComplete(fullText);
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content;
                  if (content) {
                    fullText += content;
                    onChunk(fullText);
                  }
                } catch (e) {
                  console.warn("Erro ao parsear chunk:", e);
                }
              }
            }
          }
        }

        onComplete(fullText);
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Requisição cancelada pelo usuário");
        } else {
          console.error("Erro ao chamar DeepSeek API:", error);
          throw error;
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [rawData]
  );

  const handleSubmit = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>): Promise<void> => {
      event?.preventDefault();
      if (!input.trim() || isStreaming || isLoadingData) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsStreaming(true);

      // Criar mensagem vazia para o streaming
      const streamingMessageId = (Date.now() + 1).toString();
      const streamingMessage: Message = {
        id: streamingMessageId,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, streamingMessage]);
      setStreamingMessageId(streamingMessageId);

      try {
        const conversationHistory = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        await callDeepSeekAPI(
          userMessage.content,
          conversationHistory,
          (chunk) => {
            // Atualizar mensagem de streaming
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === streamingMessageId ? { ...msg, content: chunk } : msg
              )
            );
          },
          (fullText) => {
            console.log("Streaming completo:", fullText.length, "caracteres");
          }
        );
      } catch (error) {
        console.error("Erro:", error);
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content:
            "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsStreaming(false);
        setStreamingMessageId(null);
      }
    },
    [input, isStreaming, isLoadingData, messages, callDeepSeekAPI]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // Cancelar streaming quando componente desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="w-full h-full">
      <article className="flex flex-col w-full overflow-hidden h-full justify-between items-center">
        {/* Área das mensagens */}
        <div className="flex-1 w-full overflow-y-auto p-4">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="opacity-70 h-full flex flex-col justify-center items-center"
              >
                <h1 className="text-2xl font-bold">
                  Relator, a IA do Depad/MDS
                </h1>
                <p className="text-center mt-2">
                  Faça perguntas sobre os dados do sistema
                </p>
                {isLoadingData && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-sm text-gray-500"
                  >
                    📄 Carregando dados do arquivo...
                  </motion.div>
                )}
                {!isLoadingData && rawData && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-sm text-green-600"
                  >
                    ✅ Dados carregados
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="messages"
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <motion.div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      } ${message.id === streamingMessageId ? "border-2 border-blue-300" : ""}`}
                    >
                      {message.role === "assistant" ? (
                        <MarkdownRenderer content={message.content} />
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                      {message.id === streamingMessageId &&
                        message.content.length === 0 && (
                          <div className="flex space-x-1">
                            {[0, 1, 2].map((index) => (
                              <motion.div
                                key={index}
                                animate={{ y: [0, -8, 0] }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  delay: index * 0.2,
                                  ease: "easeInOut",
                                }}
                                className="w-2 h-2 bg-gray-500 rounded-full"
                              />
                            ))}
                          </div>
                        )}
                    </motion.div>
                  </motion.div>
                ))}

                {isStreaming && !streamingMessageId && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-200 text-gray-800 rounded-lg p-3">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((index) => (
                          <motion.div
                            key={index}
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: index * 0.2,
                              ease: "easeInOut",
                            }}
                            className="w-2 h-2 bg-gray-500 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="w-full relative">
          <div className="w-full flex-row p-3 flex border-t border-gray-700 justify-center items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
              className="w-full p-4 focus:border-0 focus:outline-0 bg-transparent disabled:opacity-50"
              placeholder={
                isLoadingData
                  ? "Carregando dados..."
                  : "Faça uma pergunta sobre os dados"
              }
              disabled={isStreaming || isLoadingData}
            />
            <button
              onClick={() => handleSubmit()}
              disabled={isStreaming || isLoadingData || !input.trim()}
              className="cursor-pointer bg-blue-400 rounded-full flex justify-center items-center p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUp size={18} className="text-white" />
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
