"use client"; // CRUCIAL: Define a página inteira como Client Component

import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8080/api/kitnets/search';

export default function Home() {
    const [kitnets, setKitnets] = useState([]);
    const [cep, setCep] = useState('');
    const [min, setMin] = useState('');
    const [max, setMax] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Flag para controle de Hydration: TRUE somente após o componente montar no cliente.
    // Esta flag impede a renderização de conteúdo dinâmico no Server Side Render (SSR) inicial.
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

    // Seta isMounted para true após a montagem do cliente e dispara a busca inicial
    useEffect(() => {
        setIsMounted(true);
        handleSearch();
    }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Busca de Kitnets</h1>

            {/* Formulário de Busca */}
            <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">

                {/* Input CEP */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP (Busca na Descrição)</label>
                    <input type="text" value={cep} onChange={(e) => setCep(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: 88050"/>
                </div>

                {/* Input Preço Mínimo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço Mín.</label>
                    <input type="number" value={min} onChange={(e) => setMin(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="0.00"/>
                </div>

                {/* Input Preço Máximo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço Máx.</label>
                    <input type="number" value={max} onChange={(e) => setMax(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="2000.00"/>
                </div>

                {/* Botão de Busca */}
                <div className="flex items-end">
                    <button type="submit" disabled={loading} className="w-full p-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-150 ease-in-out disabled:bg-gray-400">
                        {loading ? 'Buscando...' : 'Buscar Kitnets'}
                    </button>
                </div>
            </form>

            {/* Exibição Condicional dos Resultados (Só renderiza a lista se montado) */}
            {isMounted ? (
                <div className="space-y-4">
                    {error && <p className="text-red-600 mb-4">{error}</p>}

                    {loading ? (
                        <p className="text-gray-500">Carregando resultados...</p>
                    ) : kitnets.length > 0 ? (
                        kitnets.map((kitnet) => (
                            <div key={kitnet.id} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                                <h2 className="text-xl font-semibold text-gray-900">{kitnet.nome}</h2>
                                <p className="text-lg font-bold text-green-600">R$ {(kitnet.valor ?? 0).toFixed(2)}</p>
                                <p className="text-sm text-gray-600">Vagas: {kitnet.vagas} | Taxa: R$ {(kitnet.taxa ?? 0).toFixed(2)}</p>
                                <p className="text-sm text-gray-500 mt-2">{kitnet.descricao}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">Nenhuma kitnet encontrada com os filtros atuais.</p>
                    )}
                </div>
            ) : (
                // Renderizado no SSR e no início do CSR (conteúdo estável)
                <p className="text-gray-500">Inicializando a interface e buscando dados iniciais...</p>
            )}
        </div>
    );
}