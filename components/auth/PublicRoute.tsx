import { useMsal } from "@azure/msal-react";
import { useEffect, useState, type PropsWithChildren } from "react";
import { useNavigate } from "react-router";

export default function PublicRoute({ children }: PropsWithChildren) {
  const { accounts } = useMsal();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (accounts.length > 0) {
      navigate("/");
    } else {
      setIsCheckingAuth(false);
    }
  }, [accounts, navigate]);

  if (isCheckingAuth) return null; // Ou um componente de loading
  return <>{children}</>;
}
