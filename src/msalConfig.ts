export const msalConfig = {
  auth: {
    clientId: "dc0d48f4-80cc-4270-9150-f3b00049d456",
    authority: "https://login.microsoftonline.com/49e66e23-2e11-4c98-9799-c02815282bd6",
    redirectUri:  typeof window !== 'undefined' ? window.location.origin : null,
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : null,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: string, containsPii: boolean) => {
        if (containsPii) return;
        switch (level) {
          case 0: // Error
            console.error(message);
            break;
          case 1: // Warning
            console.warn(message);
            break;
          case 2: // Info
            console.info(message);
            break;
          case 3: // Verbose
            console.debug(message);
            break;
        }
      },
      logLevel: 3, // Verbose
    },
  },
};

export const loginRequest = {
  scopes: ["User.Read"],
};

export const apiTokenRequest = {
  scopes: ["api://msal.react.restapi/RestApi.Consumer.ReadWrite"],
};


