import LogoutMsal from "components/auth/LogoutMsal";
import { useMsal } from "@azure/msal-react";
import getUser from "service/profileInfo/getUsername";
import type { PublicClientApplication } from "@azure/msal-browser";
import { useEffect, useState } from "react";

export default function DashboardGeral() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const { instance } = useMsal();
  useEffect(() => {
    const getDisplayNameViaGraph = async () => {
      try {
        const user = await getUser(instance as PublicClientApplication);
        setDisplayName(user.displayName);
      } catch (error) {
        console.error("Error fetching user: ", error);
      }
    };
    getDisplayNameViaGraph();
  }, []);
  return (
    <section>
      Você está no dashboard Geral username: {displayName}
      <LogoutMsal />
    </section>
  );
}
