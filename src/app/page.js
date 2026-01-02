"use client"; // CRUCIAL: Define a página inteira como Client Component

import { useState, useEffect } from 'react';
import Link from 'next/link';
// Verifique se o caminho do seu Navbar está correto
import Navbar from '@/components/Navbar';

const API_BASE_URL = 'http://localhost:8080/api/kitnets';

export default function Home() {
    const [kitnets, setKitnets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Flag para controle de Hydration
    const [isMounted, setIsMounted] = useState(false);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();

        setLoading(true);
        setError(null);

        try {
            let url = API_BASE_URL;
            if (searchQuery.trim()) {
                url = `${API_BASE_URL}/search/ai?query=${encodeURIComponent(searchQuery)}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Erro ao buscar dados: Status ${response.status}`);
            }

            const data = await response.json();
            setKitnets(data);

        } catch (err) {
            console.error("Erro na busca:", err);
            setError("Não foi possível buscar as kitnets. Verifique o servidor Backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        handleSearch();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50">
            {/* 1. Navbar Fixa no Topo */}
            <Navbar />

            {/* 2. Container principal com padding-top para compensar a Navbar fixa */}
            <div className="pt-24 px-4">
                <div className="max-w-4xl mx-auto">

                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Encontre seu novo lar</h1>
                        <p className="text-gray-600">Busque de forma natural, como se estivesse conversando com um amigo.</p>
                    </div>

                    {/* Formulário de Busca Semântica */}
                    <form onSubmit={handleSearch} className="mb-12 relative max-w-2xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full p-4 pl-6 pr-32 rounded-full border border-gray-300 shadow-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-900 text-lg transition-all outline-none"
                                placeholder="Ex: Kitnet mobiliada no centro com garagem até R$ 1500"
                            />
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white font-bold px-6 rounded-full hover:bg-blue-700 transition duration-150 ease-in-out disabled:bg-gray-400 flex items-center gap-2"
                            >
                                {loading ? (
                                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                ) : (
                                    <>
                                        <span>Buscar</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Exibição Condicional dos Resultados */}
                    {isMounted ? (
                        <div className="space-y-4 pb-10">
                            {error && <p className="text-red-600 mb-4 bg-red-50 p-3 rounded border border-red-200">{error}</p>}

                            {loading ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-500 text-lg animate-pulse">A inteligência artificial está encontrando as melhores opções para você...</p>
                                </div>
                            ) : kitnets.length > 0 ? (
                                kitnets.map((kitnet) => {
                                    const firstPhoto = kitnet.photos && kitnet.photos.length > 0 ? kitnet.photos[0] : null;
                                    let mainPhoto = '/window.svg';

                                    if (firstPhoto) {
                                        const path = firstPhoto.thumbnailUrl || firstPhoto.url;
                                        mainPhoto = path.startsWith('http') ? path : `http://localhost:8080${path}`;
                                    }

                                    return (
                                        <Link href={`/kitnet/${kitnet.id}`} key={kitnet.id} className="block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow hover:border-blue-300 cursor-pointer group">
                                            <div className="flex flex-col md:flex-row gap-4">
                                                {/* Imagem Thumb */}
                                                <div className="w-full md:w-48 h-48 md:h-32 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 relative">
                                                    <img 
                                                        src={mainPhoto} 
                                                        alt={kitnet.name} 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>

                                                {/* Conteúdo */}
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{kitnet.name}</h2>
                                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{kitnet.description}</p>
                                                        </div>
                                                        <div className="text-right flex-shrink-0 ml-4">
                                                            <p className="text-xl font-bold text-green-600">R$ {(kitnet.value ?? 0).toFixed(2)}</p>
                                                            <span className="text-xs text-gray-500 block mt-1">Taxa: R$ {(kitnet.fee ?? 0).toFixed(2)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto pt-4 flex items-center gap-4 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1 font-medium bg-gray-100 px-2 py-1 rounded">
                                                            🛏️ {kitnet.parkingSpaces} {kitnet.parkingSpaces === 1 ? 'Vaga' : 'Vagas'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                                    <p className="text-gray-500 font-medium text-lg">Nenhuma kitnet encontrada.</p>
                                    <p className="text-gray-400 text-sm mt-2">Tente descrever de outra forma ou simplifique sua busca.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">Inicializando...</p>
                    )}
                </div>
            </div>
        </main>
    );
}