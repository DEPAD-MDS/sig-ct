import { motion } from 'framer-motion';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from 'msalConfig';

const handleLogin = (instance:any) =>{
  instance.loginRedirect(loginRequest).catch((e:any) =>{
    console.error(e)
  })
}

export default function Login() {

  const {instance} = useMsal()
  return (
    <div className="min-h-screen from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background com fade in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/background.jpg")'
        }}
      />

      {/* Card principal com scale e fade in */}
      <motion.section
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-neutral-300"
      >
        <div className="text-center space-y-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-2"
          >
            <img src='/sigct-full-logo.png' alt="logo"/>
          </motion.div>

          {/* Texto de boas-vindas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-3"
          >

            <p className="text-gray-600 text-sm leading-relaxed">
              Entre com a sua conta Institucional para acessar a plataforma.
            </p>
          </motion.div>

          {/* Botão azul com animação de gradiente no hover */}
          <motion.button
            onClick={() => handleLogin(instance)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="w-full cursor-pointer bg-gradient-to-r from-blue-800 to-blue-900 text-white py-3 px-4 rounded-xl font-medium shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
          >
            
            Entrar com sua conta Institucional MDS
          </motion.button>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-xs text-gray-500"
          >
            Autenticação segura com Microsoft Azure authentication
          </motion.p>
        </div>
      </motion.section>
    </div>
  );
}