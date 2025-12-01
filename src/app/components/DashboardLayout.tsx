import { useMsal } from "@azure/msal-react";
import { Navigate, Outlet, useLocation, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useContext, useMemo } from "react";
import {
  Home,
  Bell,
  CheckSquare,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  type LucideIcon,
  MoonStarIcon,
  LanguagesIcon,
  BellRingIcon,
  ComputerIcon,
  BotIcon,
  DollarSign,
  Search,
  ScrollText,
} from "lucide-react";
import { useSearchCommunities } from "~/hooks/useSearchCommunities";
import Modal from "./Modal";
import React from "react";
import { useUserData } from "~/hooks/useUserData";

// Tipos
type Theme = "light" | "dark";

interface MenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

interface NavbarContextType {
  isSettingsModalOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
}

// Context para gerenciar estado da navbar
const NavbarContext = React.createContext<NavbarContextType | undefined>(
  undefined
);

// Hook para usar o contexto da navbar
export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error("useNavbar deve ser usado dentro de um NavbarProvider");
  }
  return context;
};

// Hook para tema
function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = () => {
      setTheme(mediaQuery.matches ? "dark" : "light");
    };

    updateTheme(); // Definir tema inicial

    mediaQuery.addEventListener("change", updateTheme);
    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return theme;
}

// Componente de Logo
function Logo({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex items-center  overflow-hidden"
        >
          <img src="/sigct-minimal-logo-white.svg" alt="SIGCT Logo" className="h-8" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Componente de Toggle Button
function ToggleButton({
  isCollapsed,
  onClick,
}: {
  isCollapsed: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
      aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
    >
      {isCollapsed ? (
        <ChevronRight className="w-4.5 h-4.5 text-gray-600 dark:text-gray-300" />
      ) : (
        <ChevronLeft className="w-4.5 h-4.5 text-gray-600 dark:text-gray-300" />
      )}
    </motion.button>
  );
}

// Componente de Menu Item
function MenuItem({
  item,
  isCollapsed,
  isActive,
}: {
  item: MenuItem;
  isCollapsed: boolean;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link to={item.path} viewTransition>
      <motion.div
        whileHover={{ x: isCollapsed ? 0 : 2 }}
        className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group ${
          isActive
            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
        }`}
      >
        <Icon className="w-5 h-5 shrink-0" />

        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="font-medium text-sm whitespace-nowrap"
            >
              {item.name}
            </motion.span>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
            {item.name}
          </div>
        )}
      </motion.div>
    </Link>
  );
}

// Componente de User Profile
function UserProfile({
  userName,
  userEmail,
  isCollapsed,
  onLogout,
}: {
  userName: string;
  userEmail: string;
  isCollapsed: boolean;
  onLogout: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { openSettingsModal } = useNavbar();
  const { userPhoto } = useUserData();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleSettingsClick = () => {
    setIsMenuOpen(false);
    openSettingsModal();
  };

  return (
    <div ref={menuRef} className="relative">
      <div
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex gap-3 p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer items-center group"
      >
        <div className="w-10 h-10 overflow-hidden from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">
          {userPhoto ? (
            <img
              alt="Foto de perfil"
              src={`data:image/png;base64, ${userPhoto}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userEmail}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
            <p className="font-medium">{userName}</p>
            <p className="text-xs text-gray-300">{userEmail}</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute bottom-full mb-2 ${
              isCollapsed ? "left-full ml-2" : "left-0 right-0 mx-4"
            } bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50 min-w-[200px]`}
          >
            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Configurações
              </span>
            </button>

            <div className="border-t border-gray-200 dark:border-gray-700" />

            <button
              onClick={() => {
                setIsMenuOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Sair da conta
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Componente de Navbar Header
// Componente de Navbar Header
function NavbarHeader({ 
  onMenuClick, 
  isDesktop = false 
}: { 
  onMenuClick: () => void;
  isDesktop?: boolean;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: communities } = useSearchCommunities();
  const navigate = useNavigate();
  
  // Refs para detectar clique fora
  const searchFormRef = useRef<HTMLFormElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Fecha sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Verifica se o clique foi fora do form e das sugestões
      if (
        searchFormRef.current && 
        !searchFormRef.current.contains(event.target as Node) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    // Adiciona listener apenas se as sugestões estão visíveis
    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  // Filtra as sugestões por CNPJ e NOME (razao_social)
  const suggestions = useMemo(() => {
    if (!communities || !debouncedSearch.trim() || debouncedSearch.length < 2) {
      setShowSuggestions(false);
      return [];
    }

    const term = debouncedSearch.toLowerCase().trim();
    
    const filtered = communities
      .filter((community) => {
        const razaoSocial = community.razao_social?.toLowerCase() || '';
        const cnpj = community.cnpj?.toString() || '';
        
        // Busca tanto no nome (razao_social) quanto no CNPJ
        return razaoSocial.includes(term) || cnpj.includes(term);
      })
      .slice(0, 5); // Máximo 5 sugestões

    // Mostra sugestões apenas se houver resultados
    setShowSuggestions(filtered.length > 0);
    return filtered;
  }, [communities, debouncedSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // Navegar para a página de comunidades com a query
      navigate(`/dashboard/comunidades?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue(""); // Limpar o input após navegação
      setShowSuggestions(false); // Fecha sugestões
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    // Mostra sugestões apenas se tiver pelo menos 2 caracteres
    if (e.target.value.trim().length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (community: any) => {
    setSearchValue(community.razao_social || community.cnpj);
    setShowSuggestions(false); // Fecha sugestões ao clicar
    
    // Navegar para a página específica da comunidade
    if (community.id) {
      navigate(`/dashboard/comunidades/${community.id}`);
    } else {
      navigate(`/dashboard/comunidades?search=${encodeURIComponent(community.razao_social || community.cnpj)}`);
    }
  };

  if (isDesktop) {
    return (
      <div className="hidden lg:flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 items-center justify-between shrink-0">
        <form 
          ref={searchFormRef}
          onSubmit={handleSubmit} 
          className="flex-1 text-sm max-w-2xl mx-auto relative"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="search"
              placeholder="Pesquisar comunidades por nome ou CNPJ..."
              value={searchValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            
            {/* Sugestões */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
              >
                {suggestions.map((community, index) => (
                  <div
                    key={community.id || index}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    onClick={() => handleSuggestionClick(community)}
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {community.razao_social}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      CNPJ: {community.cnpj}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:hidden h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between shrink-0">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      </motion.button>
      
      <div className="flex-1 mx-4 relative">
        <form 
          ref={searchFormRef}
          onSubmit={handleSubmit}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="search"
              placeholder="Pesquisar por nome ou CNPJ..."
              value={searchValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            
            {/* Sugestões Mobile */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
              >
                {suggestions.map((community, index) => (
                  <div
                    key={community.id || index}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    onClick={() => handleSuggestionClick(community)}
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {community.razao_social}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      CNPJ: {community.cnpj}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>

      <h1 className="text-lg font-semibold text-gray-900 dark:text-white min-w-[60px] text-right">
        SIGCT
      </h1>
    </div>
  );
}

// Componente de Sidebar
function Sidebar({
  isCollapsed,
  isMobileOpen,
  onToggle,
  onMobileClose,
  menuItems,
  otherItems,
  location,
  userName,
  userEmail,
  onLogout,
}: {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
  menuItems: MenuItem[];
  otherItems: MenuItem[];
  location: any;
  userName: string;
  userEmail: string;
  onLogout: () => void;
}) {
  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 280,
          x: isMobileOpen ? 0 : window.innerWidth < 1024 ? -280 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed lg:relative h-full bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col"
      >
        <div className="h-fit py-4 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <Logo isCollapsed={isCollapsed} />
          <ToggleButton isCollapsed={isCollapsed} onClick={onToggle} />
        </div>

        <div className="flex-1 px-4 py-4 overflow-y-auto overflow-x-hidden">
          <nav className="space-y-1">
            {!isCollapsed ? (
              <p className="text-sm opacity-70 px-3 mb-3">Dashboards</p>
            ) : null}
            {menuItems.map((item) => (
              <MenuItem
                key={item.name}
                item={item}
                isCollapsed={isCollapsed}
                isActive={location.pathname === item.path}
              />
            ))}
          </nav>

          <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

          <nav className="space-y-1">
            {!isCollapsed ? (
              <p className="text-sm opacity-70 px-3 mb-3">Serviços</p>
            ) : null}
            {otherItems.map((item) => (
              <MenuItem
                key={item.name}
                item={item}
                isCollapsed={isCollapsed}
                isActive={location.pathname === item.path}
              />
            ))}
          </nav>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 shrink-0">
          <UserProfile
            userName={userName}
            userEmail={userEmail}
            isCollapsed={isCollapsed}
            onLogout={onLogout}
          />
        </div>
      </motion.aside>
    </>
  );
}

// Componente Settings Modal
function SettingsModal() {
  const { isSettingsModalOpen, closeSettingsModal } = useNavbar();

  return (
    <Modal onClose={closeSettingsModal} isActive={isSettingsModalOpen}>
      <div className="w-80">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Configurações
        </h2>
        <div className="space-y-2 w-full">
          <div className="flex opacity-75 flex-row justify-between items-center">
            <div className="flex flex-row gap-2 items-center">
              <MoonStarIcon size={20}></MoonStarIcon> <p>Modo Escuro</p>
            </div>
            <button className="outline w-24 outline-gray-600 text-xs p-2 rounded-full px-4">
              Ativado
            </button>
          </div>
          <div className="flex opacity-75 flex-row justify-between items-center">
            <div className="flex flex-row gap-2 items-center">
              <BellRingIcon size={20}></BellRingIcon> <p>Notificações</p>
            </div>
            <button className="outline w-24 outline-gray-600 text-xs p-2 rounded-full px-4">
              Notificar
            </button>
          </div>
          <div className="flex opacity-75 flex-row justify-between items-center">
            <div className="flex flex-row gap-2 items-center">
              <LanguagesIcon size={20}></LanguagesIcon> <p>Linguagem</p>
            </div>
            <button className="outline w-24 outline-gray-600 text-xs p-2 rounded-full px-4">
              Português
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Componente Principal
export default function DashboardLayout() {
  const { accounts, instance } = useMsal();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useTheme(); // Aplica o tema mas não usamos o retorno

  // Context value
  const navbarContextValue: NavbarContextType = {
    isSettingsModalOpen,
    openSettingsModal: () => setIsSettingsModalOpen(true),
    closeSettingsModal: () => setIsSettingsModalOpen(false),
  };

  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: "/",
    });
  };

  const menuItems: MenuItem[] = [
    { name: "Geral", icon: Home, path: "/dashboard" },
    { name: "Repasses", icon: DollarSign, path: "/dashboard/repasses" },
    { name: "CEBAS", icon: CheckSquare, path: "/dashboard/cebas" },
  ];

  const otherItems: MenuItem[] = [
    { name: "Relator", icon: BotIcon, path: "/dashboard/relator" },
  ];

  const handleToggle = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleMobileClose = () => {
    setIsMobileOpen(false);
  };

  // Lógica de autenticação
  if (accounts.length === 0) {
    return <Navigate to="/" />;
  }

  const userName = accounts[0]?.name || "User";
  const userEmail = accounts[0]?.username || "user@example.com";

  return (
    <NavbarContext.Provider value={navbarContextValue}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          isCollapsed={isCollapsed}
          isMobileOpen={isMobileOpen}
          onToggle={handleToggle}
          onMobileClose={handleMobileClose}
          menuItems={menuItems}
          otherItems={otherItems}
          location={location}
          userName={userName}
          userEmail={userEmail}
          onLogout={handleLogout}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header para mobile */}
          <NavbarHeader 
            onMenuClick={() => setIsMobileOpen(true)} 
            isDesktop={false}
          />
          
          {/* Header para desktop */}
          <NavbarHeader 
            onMenuClick={() => setIsCollapsed(!isCollapsed)} 
            isDesktop={true}
          />

          <div className="flex-1 h-full overflow-y-auto">
            <div className="h-full">
              <Outlet />
            </div>
          </div>
        </div>
        <SettingsModal />
      </div>
    </NavbarContext.Provider>
  );
}