import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ActiveFilter {
  type: 'regiao' | 'uf' | 'municipio' | 'vagas' | 'ordenacao';
  label: string;
  value: string;
}

interface FilterTagsProps {
  filters: ActiveFilter[];
  onRemove: (filter: ActiveFilter) => void;
  onClearAll: () => void;
}

export default function FilterTags({ filters, onRemove, onClearAll }: FilterTagsProps) {
  if (filters.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-wrap gap-2 items-center mb-4"
    >
      <span className="text-sm text-gray-400">Filtros ativos:</span>
      <AnimatePresence>
        {filters.map((filter, index) => (
          <motion.div
            key={`${filter.type}-${filter.value}-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm"
          >
            <span className="text-gray-300">{filter.label}</span>
            <button
              onClick={() => onRemove(filter)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
      <button
        onClick={onClearAll}
        className="text-sm text-red-400 hover:text-red-300 transition-colors underline"
      >
        Limpar todos
      </button>
    </motion.div>
  );
}