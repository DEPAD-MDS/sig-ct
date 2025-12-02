import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useMemo, useState, useEffect, useCallback } from 'react'
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

    const [regionsGeoJSON, setRegionsGeoJSON] = useState<any>(null);

    // Carrega o GeoJSON do arquivo local
    useEffect(() => {
        fetch('/geojson/mapa.geojson')
            .then(response => response.json())
            .then(data => {
                console.log('GeoJSON carregado:', data);
                setRegionsGeoJSON(data);
            })
            .catch(error => console.error('Erro ao carregar GeoJSON:', error));
    }, []);

    // Estilo para as regiões com cores diferentes
    const getRegionStyle = useCallback((feature: any) => {
        const regionColors: Record<string, string> = {
            'Centro-Oeste': '#FF6B6B',
            'Nordeste': '#4ECDC4',
            'Norte': '#45B7D1',
            'Sudeste': '#96CEB4',
            'Sul': '#FFEAA7',
            'CO': '#FF6B6B',  // SIGLA
            'NE': '#4ECDC4',
            'N': '#45B7D1',
            'SE': '#96CEB4',
            'S': '#FFEAA7'
        };

        // Usa NOME1 como chave principal
        const regionName = feature?.properties?.NOME1 || 
                          feature?.properties?.NOME2 || 
                          feature?.properties?.SIGLA || 
                          'Desconhecido';
        
        return {
            fillColor: regionColors[regionName] || '#CCCCCC',
            weight: 2,
            opacity: 0.8,
            color: '#FFFFFF',
            fillOpacity: 0.3,
            dashArray: '3',
            cursor: 'pointer'  // Adiciona cursor pointer
        };
    }, []);

    // Estilo quando hover
    const highlightStyle = {
        weight: 4,
        opacity: 1,
        color: '#FFFFFF',
        fillOpacity: 0.6,
        dashArray: ''
    };

    // Função para interação com cada região
        const onEachRegion = useCallback((feature: any, layer: any) => {
            console.log('Região feature:', feature);
            
            // Adiciona popup
            if (feature.properties) {
                const props = feature.properties;
                const regionName = props.NOME1 || props.NOME2 || props.SIGLA || 'Região';
                const sigla = props.SIGLA || '';
                
                const popupContent = `
                    <div class="p-3">
                        <h3 class="font-bold text-lg text-blue-700 mb-2">${regionName}</h3>
                        ${sigla ? `<p class="text-sm mb-1"><strong>Sigla:</strong> ${sigla}</p>` : ''}
                        ${props.NOME2 && props.NOME2 !== regionName ? 
                          `<p class="text-sm"><strong>Nome completo:</strong> ${props.NOME2}</p>` : ''}
                    </div>
                `;
                
                layer.bindPopup(popupContent);
            }
    
            // Eventos de hover
            layer.on('mouseover',  (e: any) => {
                layer.setStyle(highlightStyle);
                layer.bringToFront();
                
                // Opcional: mudar cursor
                document.body.style.cursor = 'pointer';
            });
    
            layer.on('mouseout', function (e: any) {
                layer.setStyle(getRegionStyle(feature));
                
                // Restaurar cursor
                document.body.style.cursor = '';
            });
    
            // Evento de clique (opcional)
            layer.on('click', function (e: any) {
                console.log('Região clicada:', feature.properties);
            });
        }, [getRegionStyle]);

    // Componente para mostrar labels das regiões
    function RegionLabels() {
        const map = useMap();
        
        // Posições aproximadas para os labels
        const regionLabels = [
            { name: "Norte", position: [-5, -60] as [number, number], sigla: "N" },
            { name: "Nordeste", position: [-8, -40] as [number, number], sigla: "NE" },
            { name: "Centro-Oeste", position: [-15, -53] as [number, number], sigla: "CO" },
            { name: "Sudeste", position: [-20, -45] as [number, number], sigla: "SE" },
            { name: "Sul", position: [-27, -52] as [number, number], sigla: "S" }
        ];

        useEffect(() => {
            if (!map) return;
            
            

            return () => {
                // Limpa os markers quando o componente é desmontado
                map.eachLayer((layer: any) => {
                    if (layer instanceof L.Marker && layer.options.interactive === false) {
                        map.removeLayer(layer);
                    }
                });
            };
        }, [map]);

        return null;
    }

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

                {/* Renderiza o GeoJSON das regiões se estiver carregado */}
                {regionsGeoJSON && (
                    <GeoJSON
                        key="regions-geojson"
                        data={regionsGeoJSON}
                        style={getRegionStyle}
                        onEachFeature={onEachRegion}
                    />
                )}

                {/* Labels das regiões */}
                <RegionLabels />

                <OptimizedMarkers data={limitedData} />
            </MapContainer>

            {/* Adicione este CSS inline ou em seu arquivo CSS global */}
            <style jsx global>{`
                .region-label {
                    background: rgba(0, 0, 0, 0.6);
                    padding: 4px 12px;
                    border-radius: 8px;
                    white-space: nowrap;
                    text-align: center;
                    backdrop-filter: blur(2px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .region-label-container {
                    background: transparent !important;
                    border: none !important;
                }
                
                .text-shadow {
                    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
                }
                
                /* Garante que os layers do GeoJSON sejam interativos */
                .leaflet-interactive {
                    cursor: pointer !important;
                }
                
                .leaflet-container {
                    cursor: default;
                }
            `}</style>
        </div>
    );
}