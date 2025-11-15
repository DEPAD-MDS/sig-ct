// o código abaixo é para referencias apenas, não utilizar na versão final

import { ArrowUpIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Mock simples da IA
const mockAIResponse = (userMessage: string) => {
  return `Entendi sua solicitação sobre "${userMessage}". Vou analisar nossa base de dados do Depad/MDS e criar um relatório personalizado para você.`;
};

export default function Relator() {
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll para baixo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (event) => {
    event?.preventDefault();
    if (!input.trim()) return;

    // Mensagem do usuário
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Resposta mock da IA
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant", 
        content: mockAIResponse(input)
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full h-full">
      <article className="flex flex-col w-full overflow-hidden h-full justify-between items-center">
        {/* Área das mensagens - MANTIDO SEU LAYOUT */}
        <div className="flex-1 w-full overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="opacity-70 h-full flex flex-col justify-center items-center">
              <h1 className="text-2xl font-bold">
                Seja bem vindo a primeira IA do Depad/MDS!
              </h1>
              <p className="text-center mt-2">
                Crie relatórios e resumos com a nossa base de dados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user" 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - MANTIDO SEU LAYOUT ORIGINAL */}
        <div className="w-full relative">
          <form 
            onSubmit={handleSubmit}
            className="w-full flex-row p-3 flex border-t border-gray-700 justify-center items-center"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
              className="w-full p-4 focus:border-0 focus:outline-0 bg-transparent"
              placeholder="Peça para o Relator"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="cursor-pointer bg-blue-400 rounded-full flex justify-center items-center p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpIcon size={18} className="text-white" />
            </button>
          </form>
          
        
        </div>
      </article>
    </div>
  );
}