import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useMemo, useState, useEffect } from 'react'
import L from 'leaflet'
import { debounce } from 'lodash'

export default function Map({ dataReq }: { dataReq: any[] }) {
    const iconPerson = useMemo(() => new L.Icon({
        iconUrl: '/graphs/map/marker.svg',
        iconRetinaUrl: '/graphs/map/marker.svg',
        iconSize: new L.Point(15, 15),
        className: 'leaflet-marker-icon'
    }), []);

    if (!dataReq || dataReq.length === 0) return(
        <section className='border justify-center items-center flex border-white/60 rounded-xl h-140 w-full overflow-hidden relative'>
            Ops, parece que não tem nenhum dado.
        </section>
    )

    const validData = useMemo(() => {
        return dataReq.filter(community => {
            const lat = parseFloat(community.latitude);
            const lng = parseFloat(community.longitude);
            return !isNaN(lat) && !isNaN(lng);
        });
    }, [dataReq]);

    // Limita o número de markers para performance
    const limitedData = useMemo(() => {
        return validData.slice(0, 10000); // Máximo de markers
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

        // Simplifica popups em zoom baixo
        const showDetailedPopup = currentZoom > 8;

        return (
            <>
                {data.map((community, index) => {
                    const lat = parseFloat(community.latitude);
                    const lng = parseFloat(community.longitude);

                    return (
                        <Marker 
                            icon={iconPerson} 
                            key={community.cnpj || `marker-${index}`} 
                            position={[lat, lng]}
                        >
                            <Popup maxWidth={300} minWidth={200}>
                                <div className="p-2">
                                    <h3 className="font-bold text-sm mb-2 text-blue-700">
                                        {community.nome_fantasia}
                                    </h3>
                                    {showDetailedPopup ? (
                                        <div className="text-xs space-y-1">
                                            <p><strong>Município:</strong> {community.municipio} - {community.uf}</p>
                                            <p><strong>Endereço:</strong> {community.endereco}</p>
                                            <p><strong>Telefone:</strong> {community.telefone}</p>
                                            <p><strong>Email:</strong> {community.email}</p>
                                            <p><strong>Vagas Contratadas:</strong> {community.vagas_contratadas}</p>
                                            <p><strong>Adultos Masc:</strong> {community.adulto_masc} | <strong>Fem:</strong> {community.adulto_feminino}</p>
                                        </div>
                                    ) : (
                                        <div className="text-xs">
                                            <p><strong>Município:</strong> {community.municipio} - {community.uf}</p>
                                            <p><strong>Vagas:</strong> {community.vagas_contratadas}</p>
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
        <div className='border z-0 border-white/60 rounded-xl h-140 w-full overflow-hidden relative'>
            <MapContainer
                center={[-15.7917, -47.8750]}
                zoom={4}
                scrollWheelZoom={true}
                className='h-full w-full'
                preferCanvas={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                />
            
                <OptimizedMarkers data={limitedData} />
            </MapContainer>
        </div>
    )
}