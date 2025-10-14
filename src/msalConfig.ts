export const msalConfig = {
    auth: {
      clientId: "dc0d48f4-80cc-4270-9150-f3b00049d456",
      authority: "https://login.microsoftonline.com/49e66e23-2e11-4c98-9799-c02815282bd6",
      redirectUri: "/",
    },
    cache: {
      cacheLocation: "localStorage", // This configures where your cache will be stored
      storeAuthStateInCookie: true, // Set this to "true" if you are having issues on IE11 or Edge
    },
  };
  
export const loginRequest = {
    scopes: ["User.Read"],
  };
  
export const apiTokenRequest = {
    scopes: ["api://msal.react.restapi/RestApi.Consumer.ReadWrite"],
  };