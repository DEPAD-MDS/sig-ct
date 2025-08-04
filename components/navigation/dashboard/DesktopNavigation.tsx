import { Outlet, Link } from "react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";

import { PublicClientApplication } from "@azure/msal-browser";
import getEmail from "services/profileInfo/getEmail";
import getPfp from "services/profileInfo/getPfp";
import getUser from "services/profileInfo/getUser";

interface UserData {
  displayName?: string;
  email?: string;
  pfp?: string | null;
}

export default function DesktopNavigation() {
  const {instance} = useMsal();
  const [activeTab, setActiveTab] = useState("Geral");
  const [userData, setUserData] = useState<UserData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navItems = [
    { name: "Geral", path: "/" },
    { name: "Cebas", path: "/cebas" },
    { name: "Repasses", path: "/repasses" }
  ];

  useEffect(() => {
    if (!instance) {
      setError("Instância de autenticação não disponível");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Primeiro obtemos os dados básicos do usuário
        const userInfo = await getUser(instance as PublicClientApplication);
        
        // Depois buscamos email e foto em paralelo
        const [email, pfp] = await Promise.all([
          getEmail(instance as PublicClientApplication).catch(() => null),
          getPfp(instance as PublicClientApplication).catch(() => null)
        ]);

        setUserData({
          displayName: userInfo?.displayName || userInfo?.givenName || 'Usuário',
          email: email || userInfo?.mail || userInfo?.userPrincipalName || 'E-mail não disponível',
          pfp: pfp || null
        });
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        setError("Erro ao carregar informações do usuário");
        setUserData({
          displayName: 'Usuário',
          email: 'E-mail não disponível',
          pfp: null
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [instance]);

  // Função para obter os dois primeiros nomes
  const getShortName = (fullName?: string) => {
    if (!fullName) return "Usuário";
    
    const names = fullName.split(' ').filter(Boolean);
    if (names.length <= 2) return fullName;
    
    return `${names[0]} ${names[1]}`;
  };

  // Função para obter iniciais
  const getInitials = (fullName?: string) => {
    if (!fullName) return "US";
    
    const names = fullName.split(' ').filter(Boolean);
    if (names.length === 0) return "US";
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  };

  return (
    <main className="flex flex-row h-screen overflow-hidden bg-gray-50">
      {/* Navbar Lateral */}
      <motion.nav 
        className="bg-white border-r border-gray-200 text-gray-700 w-64 flex flex-col h-full fixed shadow-sm"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div 
          className="p-6 border-b border-gray-200 flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
        >
          <img 
            src="/icons/sigct-minimal-logo.svg" 
            alt="Logo" 
            className="h-10"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/icons/default-logo.svg';
            }}
          />
        </motion.div>
        
        {/* Itens de Navegação */}
        <div className="flex-1 flex flex-col mt-4">
          {navItems.map((item) => (
            <motion.div
              key={item.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                to={item.path}
                className={`relative w-full py-3 px-6 text-left flex items-center transition-all duration-300 ${
                  activeTab === item.name 
                    ? "text-blue-600 bg-blue-50 font-medium" 
                    : "hover:text-blue-500 hover:bg-blue-50/50"
                }`}
                onClick={() => setActiveTab(item.name)}
              >
                {activeTab === item.name && (
                  <motion.span 
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span className="ml-4">{item.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
        
        {/* Card do Usuário */}
        <motion.div 
          className="p-4 border-t border-gray-200 bg-gray-50/50"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex items-center">
            <motion.div 
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 mr-3 overflow-hidden flex items-center justify-center text-white font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <div className="animate-pulse bg-blue-400 w-full h-full" />
              ) : userData.pfp ? (
                <img 
                  src={userData.pfp} 
                  alt="Foto do usuário" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                    (e.target as HTMLImageElement).className = 'hidden';
                  }}
                />
              ) : (
                <span>{getInitials(userData.displayName)}</span>
              )}
            </motion.div>
            
            <div className="overflow-hidden">
              {error ? (
                <>
                  <p className="font-medium text-red-500 text-sm">Erro ao carregar</p>
                  <p className="text-xs text-gray-500">Tente recarregar a página</p>
                </>
              ) : loading ? (
                <>
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </>
              ) : (
                <>
                  <p className="font-medium truncate" title={userData.displayName}>
                    {getShortName(userData.displayName)}
                  </p>
                  <p 
                    className="text-sm text-gray-500 truncate" 
                    title={userData.email}
                  >
                    {userData.email}
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.nav>
      
      {/* Conteúdo Principal */}
      <div className="ml-64 flex-1 overflow-y-auto p-6">
        <Outlet />
      </div>
    </main>
  );
}