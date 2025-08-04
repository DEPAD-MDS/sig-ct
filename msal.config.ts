export const msalConfig = {
    auth: {
      clientId: "dc0d48f4-80cc-4270-9150-f3b00049d456",
      authority: "https://login.microsoftonline.com/49e66e23-2e11-4c98-9799-c02815282bd6",
      redirectUri: "http://localhost:5173",
    },
    cache: {
      cacheLocation: "localStorage", 
      storeAuthStateInCookie: true,
    },
  };
  
export const loginRequest = {
    scopes: ["User.Read", "mail.read"],
  };
  
export const apiTokenRequest = {
    scopes: ["api://msal.react.restapi/RestApi.Consumer.ReadWrite"],
  };