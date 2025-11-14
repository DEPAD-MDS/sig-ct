import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ModalProps {
  children: ReactNode;
  isActive: boolean;
  onClose?: () => void;
}

export default function Modal(props: ModalProps) {
  const [isOpen, setIsOpen] = useState(props.isActive);
  useEffect(() => {
    setIsOpen(props.isActive);
  }, [props.isActive]);

  const handleClose = () => {
    setIsOpen(false);
    props.onClose?.();
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen ? (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{delay:0.1}}
          onClick={handleClose}
          className="absolute top-0 bottom-0 left-0 right-0 z-60 bg-black/40  w-screen h-screen flex justify-center items-center"
        >
          <motion.div
            initial={{
              opacity: 0,
              scaleY: 0.5,
              scale: 0.8,
            }}
            animate={{
              scale: 1,
              scaleY: 1,
              opacity: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
            }}
            transition={{delay:0.1}}
            onClick={(e) => e.stopPropagation()}
            className="rounded-xl outline-1  bg-gray-50 dark:bg-gray-800 outline-gray-700  p-6"
          >
            {props.children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
