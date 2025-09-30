import { useMsal } from "@azure/msal-react";
import { Navigate, Outlet } from "react-router";
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Home, Bell, CheckSquare, Settings, BookOpen, UserPlus, List, HelpCircle, Menu, ChevronLeft, ChevronRight, type LucideIcon,  } from 'lucide-react';

// Tipos
type Theme = 'light' | 'dark';

interface MenuItem {
    name: string;
    icon: LucideIcon;
}

interface LogoProps {
    isCollapsed: boolean;
}

interface ToggleButtonProps {
    isCollapsed: boolean;
    onClick: () => void;
}

interface MenuItemProps {
    item: MenuItem;
    isCollapsed: boolean;
}

interface UserProfileProps {
    userName: string;
    userEmail: string;
    userInitial: string;
    isCollapsed: boolean;
}

interface MobileHeaderProps {
    onMenuClick: () => void;
}

// Hook para tema
function usePreferredTheme(): any {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(isDark ? 'dark' : 'light');

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e:any) => setTheme(e.matches ? 'dark' : 'light');
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return theme;
}

// Componente de Logo
function Logo({ isCollapsed }: LogoProps) {
    return (
        <AnimatePresence mode="wait">
            {!isCollapsed && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex items-center gap-3 overflow-hidden"
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg font-bold">S</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        SIGCT
                    </h1>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Componente de Toggle Button
function ToggleButton({ isCollapsed, onClick }: ToggleButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0 ml-auto"
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
            {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
        </motion.button>
    );
}

// Componente de Menu Item
function MenuItem({ item, isCollapsed } : any) {
    const Icon = item.icon;
    
    return (
        <motion.button
            whileHover={{ x: isCollapsed ? 0 : 2 }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors relative group"
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            
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
            
            {/* Tooltip para modo colapsado */}
            {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                    {item.name}
                </div>
            )}
        </motion.button>
    );
}

// Componente de User Profile
function UserProfile({ userName, userEmail, userInitial, isCollapsed } : any) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer relative group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">{userInitial}</span>
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
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Tooltip para usuário colapsado */}
            {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                    <p className="font-medium">{userName}</p>
                    <p className="text-xs text-gray-300">{userEmail}</p>
                </div>
            )}
        </div>
    );
}

// Componente de Mobile Header
function MobileHeader({ onMenuClick } : any) {
    return (
        <div className="lg:hidden h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between flex-shrink-0">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMenuClick}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Abrir menu"
            >
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </motion.button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">SIGCT</h1>
            <div className="w-10" />
        </div>
    );
}

// Componente Principal
export default function DashboardLayout() {
    const { accounts } = useMsal();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const theme = usePreferredTheme();

    const menuItems = [
        { name: 'Home', icon: Home },
        { name: 'Notifications', icon: Bell },
        { name: 'Tasks', icon: CheckSquare },
        { name: 'Settings', icon: Settings }
    ];

    const otherItems = [
        { name: 'Documentation', icon: BookOpen },
        { name: 'Refer a Friend', icon: UserPlus },
        { name: 'Index', icon: List },
        { name: 'Support', icon: HelpCircle }
    ];

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    if (accounts.length === 0) {
        return <Navigate to="/" />;
    }

    const userName = accounts[0]?.name || "User";
    const userEmail = accounts[0]?.username || "user@example.com";
    const userInitial = userName.charAt(0).toUpperCase();

    const handleToggle = () => {
        if (window.innerWidth < 1024) {
            setIsMobileOpen(false);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Overlay para mobile */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Barra lateral */}
            <motion.aside
                initial={false}
                animate={{ 
                    width: isCollapsed ? 80 : 280,
                    x: isMobileOpen ? 0 : (window.innerWidth < 1024 ? -280 : 0)
                }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="fixed lg:relative h-full bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col"
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <Logo isCollapsed={isCollapsed} />
                    <ToggleButton isCollapsed={isCollapsed} onClick={handleToggle} />
                </div>

                {/* Menu Principal */}
                <div className="flex-1 px-4 py-4 overflow-y-auto overflow-x-hidden">
                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <MenuItem key={item.name} item={item} isCollapsed={isCollapsed} />
                        ))}
                    </nav>

                    {/* Separator */}
                    <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

                    {/* Seção OTHER */}
                    <nav className="space-y-1">
                        {otherItems.map((item) => (
                            <MenuItem key={item.name} item={item} isCollapsed={isCollapsed} />
                        ))}
                    </nav>
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <UserProfile 
                        userName={userName}
                        userEmail={userEmail}
                        userInitial={userInitial}
                        isCollapsed={isCollapsed}
                    />
                </div>
            </motion.aside>

            {/* Conteúdo principal */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <MobileHeader onMenuClick={() => setIsMobileOpen(true)} />

                {/* Área de conteúdo com scroll */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}