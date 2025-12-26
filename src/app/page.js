"use client"; // CRUCIAL: Define a página inteira como Client Component

import { useState, useEffect } from 'react';
// Verifique se o caminho do seu Navbar está correto
import Navbar from '@/components/Navbar';

const API_BASE_URL = 'http://localhost:8080/api/kitnets/search';

export default function Home() {
    const [kitnets, setKitnets] = useState([]);
    const [cep, setCep] = useState('');
    const [min, setMin] = useState('');
    const [max, setMax] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Flag para controle de Hydration
    const [isMounted, setIsMounted] = useState(false);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();

        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (cep) params.append('cep', cep);
        if (min) params.append('min', min);
        if (max) params.append('max', max);

        try {
            const url = `${API_BASE_URL}?${params.toString()}`;
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

                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Busca de Kitnets</h1>

                    {/* Formulário de Busca */}
                    <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-200">

                        {/* Input CEP */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">CEP (Busca na Descrição)</label>
                            <input
                                type="text"
                                value={cep}
                                onChange={(e) => setCep(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                placeholder="Ex: 88050"
                            />
                        </div>

                        {/* Input Preço Mínimo */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Preço Mín.</label>
                            <input
                                type="number"
                                value={min}
                                onChange={(e) => setMin(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Input Preço Máximo */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Preço Máx.</label>
                            <input
                                type="number"
                                value={max}
                                onChange={(e) => setMax(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                placeholder="2000.00"
                            />
                        </div>

                        {/* Botão de Busca */}
                        <div className="flex items-end">
                            <button type="submit" disabled={loading} className="w-full p-2.5 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition duration-150 ease-in-out disabled:bg-gray-400">
                                {loading ? 'Buscando...' : 'Buscar Kitnets'}
                            </button>
                        </div>
                    </form>

                    {/* Exibição Condicional dos Resultados */}
                    {isMounted ? (
                        <div className="space-y-4 pb-10">
                            {error && <p className="text-red-600 mb-4 bg-red-50 p-3 rounded border border-red-200">{error}</p>}

                            {loading ? (
                                <p className="text-gray-500 text-center py-4">Carregando resultados...</p>
                            ) : kitnets.length > 0 ? (
                                kitnets.map((kitnet) => (
                                    <div key={kitnet.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">{kitnet.nome}</h2>
                                                <p className="text-sm text-gray-500 mt-1">{kitnet.descricao}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-green-600">R$ {(kitnet.valor ?? 0).toFixed(2)}</p>
                                                <span className="text-xs text-gray-500 block mt-1">Taxa: R$ {(kitnet.taxa ?? 0).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1 font-medium">
                                                🛏️ {kitnet.vagas} {kitnet.vagas === 1 ? 'Vaga' : 'Vagas'}
                                            </span>
                                            {/* Aqui você pode adicionar mais detalhes se tiver, ex: endereço */}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                                    <p className="text-gray-500 font-medium">Nenhuma kitnet encontrada com os filtros atuais.</p>
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