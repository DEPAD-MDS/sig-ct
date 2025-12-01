import { ArrowUpIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Mock simples da IA
const mockAIResponse = (userMessage: string) => {
  return `Entendi sua solicitação sobre "${userMessage}". Vou analisar nossa base de dados do Depad/MDS e criar um relatório personalizado para você.`;
};

export default function Relator() {
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll para baixo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
  }

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>): void => {
    event?.preventDefault();
    if (!input.trim()) return;

    // Mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Resposta mock da IA
    setTimeout(() => {
      const aiMessage: Message = {
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

  // Animações
  const messageVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  const welcomeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 0.7, 
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.6
      }
    }
  };

  const buttonVariants = {
    tap: { scale: 0.9 },
    hover: { scale: 1.05 },
    initial: { scale: 1 }
  };

  const typingIndicatorVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const dotVariants = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const formVariants = {
    typing: {
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    },
    normal: {
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    }
  };

  return (
    <div className="w-full h-full">
      <article className="flex flex-col w-full overflow-hidden h-full justify-between items-center">
        {/* Área das mensagens */}
        <div className="flex-1 w-full overflow-y-auto p-4">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div 
                key="welcome"
                variants={welcomeVariants}
                initial="hidden"
                animate="visible"
                className="opacity-70 h-full flex flex-col justify-center items-center"
              >
                <h1 className="text-2xl font-bold">
                  Seja bem vindo a primeira IA do Depad/MDS!
                </h1>
                <p className="text-center mt-2">
                  Crie relatórios e resumos com a nossa base de dados.
                </p>
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
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <motion.div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user" 
                          ? "bg-blue-500 text-white" 
                          : "bg-gray-200 text-gray-800"
                      }`}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                      >
                        {message.content}
                      </motion.p>
                    </motion.div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-200 text-gray-800 rounded-lg p-3">
                      <motion.div 
                        className="flex space-x-1"
                        variants={typingIndicatorVariants}
                        initial="initial"
                        animate="animate"
                      >
                        {[0, 1, 2].map((index) => (
                          <motion.div
                            key={index}
                            variants={dotVariants}
                            className="w-2 h-2 bg-gray-500 rounded-full"
                          />
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <motion.div 
          className="w-full relative"
        
        >
          <form 
            onSubmit={handleSubmit}
            className="w-full flex-row p-3 flex border-t border-gray-700 justify-center items-center"
          >
            <motion.input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
              className="w-full p-4 focus:border-0 focus:outline-0 bg-transparent"
              placeholder="Peça para o Relator"
              disabled={isLoading}
              whileFocus={{
                scale: 1.01,
                transition: { duration: 0.2 }
              }}
            />
            <motion.button 
              type="submit"
              disabled={isLoading || !input.trim()}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              initial="initial"
              className="cursor-pointer bg-blue-400 rounded-full flex justify-center items-center p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpIcon size={18} className="text-white" />
            </motion.button>
          </form>
        </motion.div>
      </article>
    </div>
  );
}