import React, { useState, useEffect, useRef } from 'react';
import { Upload, MapPin, TrendingUp } from 'lucide-react';

interface DataPoint {
  id: string;
  state: string;
  city: string;
  vagas: number;
  lat: number;
  lng: number;
}

// Mock data generator
const generateMockData = (): DataPoint[] => {
  const states = ["SP", "RJ", "MG", "ES", "PR", "SC", "RS", "BA", "PE", "CE", "AM", "PA", "MT", "GO", "DF", "MS"];
  const cities: Record<string, string[]> = {
    SP: ["São Paulo", "Campinas", "Santos", "Ribeirão Preto", "Sorocaba"],
    RJ: ["Rio de Janeiro", "Niterói", "Duque de Caxias", "Nova Iguaçu"],
    MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora"],
    BA: ["Salvador", "Feira de Santana", "Vitória da Conquista"],
    PR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa"],
    SC: ["Florianópolis", "Joinville", "Blumenau", "Chapecó"],
    RS: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas"],
  };
  
  const data: DataPoint[] = [];
  states.forEach(state => {
    const numPoints = Math.floor(Math.random() * 15) + 5;
    for (let i = 0; i < numPoints; i++) {
      const stateCities = cities[state] || ["Capital"];
      data.push({
        id: `${state}-${i}`,
        state,
        city: stateCities[Math.floor(Math.random() * stateCities.length)],
        vagas: Math.floor(Math.random() * 500) + 10,
        lat: -15 + Math.random() * 20,
        lng: -55 + Math.random() * 15
      });
    }
  });
  return data;
};

export default function Geral() {
  const [viewMode, setViewMode] = useState<'points' | 'heatmap'>('points');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [data] = useState<DataPoint[]>(generateMockData());
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [leafletLoaded, setLeafletLoaded] = useState<boolean>(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const statesLayerRef = useRef<any>(null);

  // Get available states and cities
  const states = Array.from(new Set(data.map(d => d.state))).sort();
  const cities = selectedState === 'all' 
    ? Array.from(new Set(data.map(d => d.city))).sort()
    : Array.from(new Set(data.filter(d => d.state === selectedState).map(d => d.city))).sort();

  // Filter and sort data
  const filteredData = data
    .filter(d => selectedState === 'all' || d.state === selectedState)
    .filter(d => selectedCity === 'all' || d.city === selectedCity)
    .sort((a, b) => sortOrder === 'desc' ? b.vagas - a.vagas : a.vagas - b.vagas);

  // Handle GeoJSON file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('Carregando...');
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setGeoJsonData(json);
        setUploadStatus('GeoJSON carregado com sucesso!');
        setTimeout(() => setUploadStatus(''), 3000);
      } catch (error) {
        setUploadStatus('Erro ao carregar arquivo. Verifique se é um GeoJSON válido.');
        setTimeout(() => setUploadStatus(''), 3000);
      }
    };
    
    reader.readAsText(file);
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
    script.onload = () => {
      const L = (window as any).L;
      
      // Initialize map
      const map = L.map(mapRef.current, {
        center: [-15, -52],
        zoom: 4,
        minZoom: 3,
        maxZoom: 10
      });

      // Add grayscale tile layer with filter
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        className: 'map-tiles'
      }).addTo(map);

      // Add CSS filter for grayscale
      const style = document.createElement('style');
      style.textContent = `
        .map-tiles {
          filter: grayscale(100%) contrast(1.2) brightness(0.8);
        }
      `;
      document.head.appendChild(style);

      leafletMapRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      statesLayerRef.current = L.layerGroup().addTo(map);
      
      // Wait for map to be fully loaded
      map.whenReady(() => {
        setTimeout(() => {
          map.invalidateSize();
          setLeafletLoaded(true);
        }, 200);
      });
    };
    document.body.appendChild(script);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update GeoJSON layer
  useEffect(() => {
    if (!leafletLoaded || !leafletMapRef.current || !statesLayerRef.current) return;
    if (!(window as any).L) return;

    const L = (window as any).L;
    statesLayerRef.current.clearLayers();

    if (!geoJsonData) return;

    // Calculate state statistics
    const stateStats: Record<string, number> = {};
    filteredData.forEach(item => {
      if (!stateStats[item.state]) {
        stateStats[item.state] = 0;
      }
      stateStats[item.state] += item.vagas;
    });

    const maxVagas = Math.max(...Object.values(stateStats), 1);

    // Add GeoJSON layer
    const geoJsonLayer = L.geoJSON(geoJsonData, {
      style: (feature: any) => {
        const stateId = feature.properties.sigla || feature.properties.UF || feature.properties.id;
        const total = stateStats[stateId] || 0;
        const opacity = selectedState === 'all' ? Math.min(total / maxVagas, 0.8) : 0.3;
        
        return {
          fillColor: selectedState === stateId ? '#3b82f6' : '#60a5fa',
          weight: selectedState === stateId ? 3 : 1,
          opacity: 1,
          color: selectedState === stateId ? '#1d4ed8' : '#475569',
          fillOpacity: selectedState === stateId ? 0.7 : opacity
        };
      },
      onEachFeature: (feature: any, layer: any) => {
        const stateId = feature.properties.sigla || feature.properties.UF || feature.properties.id;
        const stateName = feature.properties.name || feature.properties.nome || stateId;
        const total = stateStats[stateId] || 0;

        layer.on({
          mouseover: (e: any) => {
            const layer = e.target;
            layer.setStyle({
              weight: 3,
              color: '#60a5fa',
              fillOpacity: 0.7
            });
            layer.bindPopup(`
              <div style="font-family: system-ui; padding: 4px;">
                <strong style="color: #1e293b; font-size: 14px;">${stateName}</strong><br/>
                <span style="color: #475569; font-size: 12px;">Vagas: ${total.toLocaleString()}</span>
              </div>
            `).openPopup();
          },
          mouseout: (e: any) => {
            geoJsonLayer.resetStyle(e.target);
            e.target.closePopup();
          },
          click: () => {
            setSelectedState(selectedState === stateId ? 'all' : stateId);
            setSelectedCity('all');
          }
        });
      }
    });

    geoJsonLayer.addTo(statesLayerRef.current);

  }, [geoJsonData, selectedState, filteredData, leafletLoaded]);

  // Update markers
  useEffect(() => {
    if (!leafletLoaded || !leafletMapRef.current || !markersLayerRef.current) return;
    if (!(window as any).L) return;

    const L = (window as any).L;
    
    // Clear existing markers
    markersLayerRef.current.clearLayers();

    if (filteredData.length === 0) return;

    const maxVagas = Math.max(...filteredData.map(d => d.vagas), 1);

    // Wait for next frame to add markers
    requestAnimationFrame(() => {
      filteredData.forEach(item => {
        try {
          const radius = Math.sqrt(item.vagas / maxVagas) * 15 + 5;
          
          if (viewMode === 'points') {
            const circle = L.circleMarker([item.lat, item.lng], {
              radius: radius,
              fillColor: '#ef4444',
              color: '#dc2626',
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.6
            });

            circle.bindPopup(`
              <div style="font-family: system-ui; padding: 4px;">
                <strong style="color: #1e293b; font-size: 13px;">${item.city}, ${item.state}</strong><br/>
                <span style="color: #475569; font-size: 12px;">Vagas: ${item.vagas}</span>
              </div>
            `);

            circle.addTo(markersLayerRef.current);
          } else {
            // Heatmap-style circles
            const circle = L.circle([item.lat, item.lng], {
              radius: 50000,
              fillColor: item.vagas > 300 ? '#dc2626' : item.vagas > 150 ? '#f59e0b' : '#3b82f6',
              color: 'transparent',
              weight: 0,
              fillOpacity: 0.3
            });

            circle.addTo(markersLayerRef.current);
          }
        } catch (error) {
          console.error('Error adding marker:', error);
        }
      });
    });

  }, [filteredData, viewMode, leafletLoaded]);

  return (
    <section className="flex gap-6 flex-col p-6 bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-semibold text-slate-100">Dashboard Geral - Leaflet</h1>
        
        {/* View mode toggle */}
        <div className="flex gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setViewMode('points')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'points' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pontos
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'heatmap' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mapa de Calor
          </button>
        </div>
      </div>

      {/* GeoJSON Upload */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Upload className="text-blue-400" size={24} />
            <div>
              <h3 className="text-sm font-medium text-slate-200">Upload GeoJSON do IBGE</h3>
              <p className="text-xs text-slate-400">Formatos aceitos: .json, .geojson</p>
            </div>
          </div>
          
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json,.geojson"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              Escolher Arquivo
            </span>
          </label>

          {uploadStatus && (
            <div className={`text-sm px-3 py-1 rounded ${
              uploadStatus.includes('sucesso') 
                ? 'bg-green-900/30 text-green-400' 
                : uploadStatus.includes('Erro')
                ? 'bg-red-900/30 text-red-400'
                : 'bg-blue-900/30 text-blue-400'
            }`}>
              {uploadStatus}
            </div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-slate-400">
          <p>💡 Baixe o GeoJSON oficial dos estados brasileiros em:</p>
          <a 
            href="https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=intermediaria&intrarregiao=UF" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            API IBGE - Malhas Territoriais
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex flex-col gap-2 min-w-[180px]">
          <label className="text-sm font-medium text-slate-400">Estado</label>
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCity('all');
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Estados</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 min-w-[200px]">
          <label className="text-sm font-medium text-slate-400">Município</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={selectedState === 'all'}
          >
            <option value="all">Todos os Municípios</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 min-w-[200px]">
          <label className="text-sm font-medium text-slate-400">Ordenar Vagas</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Maior para Menor</option>
            <option value="asc">Menor para Maior</option>
          </select>
        </div>
      </div>

      {/* Map visualization */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div 
          ref={mapRef} 
          style={{ 
            width: '100%', 
            height: '600px',
            background: '#0f172a'
          }}
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <MapPin className="text-blue-400" size={24} />
            <div>
              <div className="text-sm font-medium text-slate-400">Total de Pontos</div>
              <div className="text-2xl font-semibold text-slate-100 mt-1">
                {filteredData.length}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-green-400" size={24} />
            <div>
              <div className="text-sm font-medium text-slate-400">Total de Vagas</div>
              <div className="text-2xl font-semibold text-slate-100 mt-1">
                {filteredData.reduce((sum, d) => sum + d.vagas, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              Ø
            </div>
            <div>
              <div className="text-sm font-medium text-slate-400">Média de Vagas</div>
              <div className="text-2xl font-semibold text-slate-100 mt-1">
                {filteredData.length > 0 
                  ? Math.round(filteredData.reduce((sum, d) => sum + d.vagas, 0) / filteredData.length)
                  : 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}