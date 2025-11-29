import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useMemo, useState, useEffect } from 'react'
import L from 'leaflet'
import { debounce } from 'lodash'

export default function Map({ dataReq }: { dataReq: any[] }) {
    const iconPerson = useMemo(
        () =>
            new L.Icon({
                iconUrl: '/graphs/map/marker.svg',
                iconRetinaUrl: '/graphs/map/marker.svg',
                iconSize: new L.Point(15, 15),
                className: 'leaflet-marker-icon'
            }),
        []
    );

    if (!dataReq || dataReq.length === 0)
        return (
            <section className="border justify-center items-center flex border-white/60 rounded-xl h-140 w-full overflow-hidden relative">
                Ops, parece que não tem nenhum dado.
            </section>
        );

    const validData = useMemo(() => {
        return dataReq.filter(community => {
            const lat = parseFloat(community.latitude);
            const lng = parseFloat(community.longitude);
            return !isNaN(lat) && !isNaN(lng);
        });
    }, [dataReq]);

    const limitedData = useMemo(() => {
        return validData.slice(0, 10000);
    }, [validData]);

    function OptimizedMarkers({ data }: { data: any[] }) {
        const map = useMap();
        const [currentZoom, setCurrentZoom] = useState(map.getZoom());

        useEffect(() => {
            const updateZoom = debounce(() => {
                setCurrentZoom(map.getZoom());
            }, 100);

            map.on('zoomend', updateZoom);

            return () => {
                map.off('zoomend', updateZoom);
            };
        }, [map]);

        const clean = (v?: string) => (v && v.trim()) || "";
        const showDetailedPopup = currentZoom > 5;

        return (
            <>
                {data.map((community, index) => {
                    const lat = parseFloat(community.latitude);
                    const lng = parseFloat(community.longitude);

                    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
                        return null;
                    }

                    const nome =
                        clean(community.nome_fantasia) ||
                        clean(community.razao_social) ||
                        "Não informado";

                    const municipio = clean(community.municipio) || "—";
                    const uf = clean(community.uf) || "—";
                    const endereco = clean(community.endereco) || "Não informado";
                    const telefone = clean(community.telefone) || "Não informado";
                    const email = clean(community.email) || "Não informado";

                    const vagas = clean(community.vagas_contratadas) || "0";
                    const adultoMasc = clean(community.adulto_masc) || "0";
                    const adultoFem = clean(community.adulto_feminino) || "0";

                    return (
                        <Marker
                            icon={iconPerson}
                            key={community.cnpj || `marker-${index}`}
                            position={[lat, lng]}
                        >
                            <Popup maxWidth={300} minWidth={200}>
                                <div>
                                    <h3 className="font-bold text-sm mb-2 text-blue-700">
                                        Comunidade: {nome}
                                    </h3>

                                    {showDetailedPopup ? (
                                        <div className="text-xs space-y-1">
                                            <p><strong>Município:</strong> {municipio} - {uf}</p>
                                            <p><strong>Endereço:</strong> {endereco}</p>
                                            <p><strong>Telefone:</strong> {telefone}</p>
                                            <p><strong>Email:</strong> {email}</p>
                                            <p><strong>Vagas Contratadas:</strong> {vagas}</p>
                                            <p>
                                                <strong>Adultos Masc:</strong> {adultoMasc} |{" "}
                                                <strong>Fem:</strong> {adultoFem}
                                            </p>
                                            <button className="py-1 px-3 text-white rounded-md cursor-pointer bg-gray-800 border border-gray-700">
                                                Ver mais
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-xs">
                                            <p><strong>Município:</strong> {municipio} - {uf}</p>
                                            <p><strong>Vagas:</strong> {vagas}</p>
                                            <button className="py-1 px-3 text-white rounded-md cursor-pointer bg-gray-800 border border-gray-700">
                                                Ver mais
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </>
        );
    }

    return (
        <div className="border z-0 border-white/60 rounded-xl h-140 w-full overflow-hidden relative">
            <MapContainer
                center={[-15.7917, -47.875]}
                zoom={4}
                scrollWheelZoom={true}
                className="h-full w-full"
                preferCanvas={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                />

                <OptimizedMarkers data={limitedData} />
            </MapContainer>
        </div>
    );
}
