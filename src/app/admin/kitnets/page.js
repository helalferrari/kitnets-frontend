'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyKitnets() {
    const [kitnets, setKitnets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchMyKitnets = async () => {
            const token = localStorage.getItem('token');
            const userStored = localStorage.getItem('user');

            if (!token || !userStored) {
                router.push('/login');
                return;
            }

            const user = JSON.parse(userStored);
            if (user.role !== 'LANDLORD') {
                router.push('/');
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/api/kitnets/my-kitnets', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        router.push('/login');
                        return;
                    }
                    throw new Error('Falha ao buscar kitnets.');
                }

                const data = await response.json();
                setKitnets(data);
            } catch (err) {
                console.error(err);
                setError('Erro ao carregar suas kitnets.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyKitnets();
    }, [router]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = kitnets.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(kitnets.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Carregando kitnets...</p>
        </div>
    );

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="container mx-auto px-4 pt-24 pb-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Minhas Kitnets</h1>
                    <Link 
                        href="/anunciar" 
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center gap-2"
                    >
                        <span>+ Nova Kitnet</span>
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Paginação no Topo */}
                {kitnets.length > itemsPerPage && (
                    <div className="flex justify-center items-center gap-4 mb-6">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-md border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'}`}
                        >
                            Anterior
                        </button>
                        <span className="text-gray-600 font-medium">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-md border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'}`}
                        >
                            Próxima
                        </button>
                    </div>
                )}

                {kitnets.length === 0 && !error ? (
                    <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg mb-4">Você ainda não tem kitnets cadastradas.</p>
                        <Link href="/anunciar" className="text-blue-600 hover:underline font-medium">
                            Comece anunciando agora!
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentItems.map((kitnet) => (
                            <div key={kitnet.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Imagem de Capa */}
                                <div className="h-48 bg-gray-100 relative">
                                    {kitnet.photos && kitnet.photos.length > 0 ? (
                                        <img 
                                            src={kitnet.photos[0].thumbnailUrl?.startsWith('http') ? kitnet.photos[0].thumbnailUrl : `http://localhost:8080${kitnet.photos[0].thumbnailUrl}`} 
                                            alt={kitnet.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <span className="text-sm">Sem foto</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                                        R$ {kitnet.value.toFixed(2)}
                                    </div>
                                </div>

                                {/* Conteúdo */}
                                <div className="p-4">
                                    <h2 className="text-xl font-bold text-gray-800 mb-2 truncate">{kitnet.name}</h2>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">
                                        {kitnet.description}
                                    </p>
                                    
                                    <div className="flex justify-between items-center border-t pt-4 mt-2">
                                        <span className="text-sm text-gray-500">
                                            {kitnet.parkingSpaces} {kitnet.parkingSpaces === 1 ? 'vaga' : 'vagas'}
                                        </span>
                                        <div className="flex gap-2">
                                            <Link 
                                                href={`/kitnet/${kitnet.id}`}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Visualizar
                                            </Link>
                                            <Link 
                                                href={`/admin/kitnets/editar/${kitnet.id}`}
                                                className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                                            >
                                                Editar
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}