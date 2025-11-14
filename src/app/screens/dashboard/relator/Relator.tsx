import { ArrowUpIcon, SendHorizonalIcon, SendIcon } from "lucide-react";
import { useState } from "react";

export default function Relator() {
  const [isTyping, setIsTyping] = useState(false);
  return (
    <div className="w-full h-full">
      <article className="flex flex-col w-full overflow-hidden h-full justify-between items-center">
        <div></div>
        <div className="opacity-70">
          <h1 className="text-2xl  font-bold">
            Seja bem vindo a primeira IA do Depad/MDS!
          </h1>
          <p className="text-center">
            Crie relatórios e resumos com a nossa base de dados.
          </p>
        </div>
        <div className="w-full relative">
          <div className="w-full flex-row p-3 flex border-t border-gray-700 justify-center items-center">
            <input
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
              className="w-full p-4 focus:border-0 focus:outline-0"
              placeholder="Peça para o Relator"
            />{" "}
            <button className="cursor-pointer bg-blue-400 rounded-full flex justify-center items-center p-2">
              <ArrowUpIcon />
            </button>
          </div>
          <div
            className={`w-full absolute h-80 bg-blue-400 shadow-blue-400  transition-all ${isTyping ? "shadow-2xl" : ""} z-50`}
          />
        </div>
      </article>
    </div>
  );
}
