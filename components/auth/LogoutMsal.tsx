import { loginRequest } from "msal.config";
import { useMsal } from "@azure/msal-react";
import { motion } from "framer-motion";

const handleLogout = (instance: any) => {
  instance.logoutRedirect(loginRequest).catch((e: any) => {
    console.error(e);
  });
};

export default function LogoutMsal() {
  const { instance } = useMsal();
  
  return (
    <motion.button
      className="flex items-center justify-center gap-2
                bg-gradient-to-r from-red-500 to-red-600
                text-white font-medium
                px-4 py-2 rounded-lg
                shadow-md hover:shadow-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => handleLogout(instance)}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" 
          clipRule="evenodd" 
        />
      </svg>
      Fazer Logout
    </motion.button>
  );
}