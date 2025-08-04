import LoginMsal from "components/auth/LoginMsal";

export default function AuthPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Seção ilustrativa (lado esquerdo) */}
      <section className="w-full md:w-1/2 bg-primary-500 text-white p-8 flex flex-col justify-center items-center"></section>
      <section className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center">
        <div className="w-full max-w-md ">
          <div className="text-center">
            <img
              src="/icons/sigct-full-logo.png"
              alt="Logo SIGCT"
              className="mx-auto h-28 w-auto mb-6"
            />
            <div className="max-w-md text-center">
              <h1 className="text-4xl font-bold mb-6">Bem-vindo ao SIGCT</h1>
              <p className="text-xl">
                Sistema Integrado de Gestão e Controle Tecnológico
              </p>
            </div>
          </div>
          <div className="bg-white p-4 flex justify-center items-center shadow rounded-lg">
            <LoginMsal />
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Problemas com o acesso?{" "}
              <a
                href="#"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Contate o suporte
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
