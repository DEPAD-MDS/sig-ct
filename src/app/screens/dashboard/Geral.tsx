import Map from '~/components/data/Map';
import { useGeralData } from '~/hooks/dashboard/useGeralData';

function MinhaPage() {
    const { communities, loading, error } = useGeralData();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Carregando mapa...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-red-500">Erro: {error}</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Mapa das Comunidades</h1>
            <Map dataReq={communities} />
        </div>
    );
}

export default MinhaPage;