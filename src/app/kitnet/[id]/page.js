"use client";

import { useState, useEffect, use, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import ImageWithFallback from '@/components/ImageWithFallback';

const API_BASE_URL = 'http://localhost:8080/api/kitnets';

export default function KitnetDetails({ params }) {
    const { id } = use(params);
    const [kitnet, setKitnet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const fetchKitnet = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/${id}`);
                if (!response.ok) {
                    throw new Error(`Erro ao buscar kitnet: ${response.status}`);
                }
                const data = await response.json();
                setKitnet(data);
            } catch (err) {
                console.error("Erro ao carregar detalhes:", err);
                setError("Não foi possível carregar os detalhes da kitnet.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchKitnet();
        }
    }, [id]);

    const openModal = (imgSrc) => {
        setSelectedImage(imgSrc);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    // Helper to build full image URL
    const getImageUrl = (path) => {
        if (!path) return '/file.svg'; 
        return path.startsWith('http') ? path : `http://localhost:8080${path}`;
    };

    // Use 'photos' from API, or fallback placeholders if empty
    const images = useMemo(() => {
        if (!kitnet) return [];
        return (kitnet.photos && kitnet.photos.length > 0) 
            ? kitnet.photos.map(p => ({
                thumb: getImageUrl(p.thumbnailUrl || p.url),
                full: getImageUrl(p.url)
            }))
            : [
                { thumb: '/file.svg', full: '/file.svg' },
                { thumb: '/globe.svg', full: '/globe.svg' },
                { thumb: '/window.svg', full: '/window.svg' }
            ];
    }, [kitnet]);

    if (loading || !isMounted) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-500 text-lg">Carregando detalhes...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
            <p className="text-red-600 mb-4 text-lg">{error}</p>
            <Link href="/" className="text-blue-600 hover:underline">Voltar para a busca</Link>
        </div>
    );

    if (!kitnet) return null;

    return (
        <main className="min-h-screen bg-gray-50 pb-10">
            <Navbar />

            <div className="pt-24 px-4 max-w-5xl mx-auto">
                <Link href="/" className="inline-flex items-center text-blue-600 hover:underline mb-6 font-medium">
                    ← Voltar para a lista
                </Link>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    
                    {/* Header */}
                    <div className="p-8 border-b border-gray-100 bg-white">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{kitnet.nome}</h1>
                                <p className="text-gray-500 mt-1 flex items-center gap-2">
                                    📍 {kitnet.endereco || "Endereço não informado"}
                                </p>
                            </div>
                            <div className="text-left md:text-right bg-blue-50 px-6 py-3 rounded-lg border border-blue-100">
                                <p className="text-3xl font-bold text-blue-700">R$ {(kitnet.valor ?? 0).toFixed(2)}</p>
                                <span className="text-sm text-blue-600 font-medium">Taxa: R$ {(kitnet.taxa ?? 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Galeria de Fotos */}
                    <div className="p-8 bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Fotos</h2>
                        {images.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((img, index) => (
                                    <div 
                                        key={index} 
                                        className="relative h-48 w-full cursor-pointer overflow-hidden rounded-lg shadow-sm border-2 border-transparent hover:border-blue-500 transition-all group"
                                        onClick={() => openModal(img.full)}
                                    >
                                        <ImageWithFallback 
                                            src={img.thumb} 
                                            alt={`Foto ${index + 1} de ${kitnet.nome}`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                                            <span className="text-white opacity-0 group-hover:opacity-100 font-bold bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">Ver Zoom</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">Nenhuma foto disponível.</p>
                        )}
                    </div>

                    {/* Detalhes e Descrição */}
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Descrição</h2>
                            <div className="prose text-gray-600 leading-relaxed">
                                {kitnet.descricao}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-fit">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Informações</h2>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex justify-between">
                                    <span className="font-medium">Vagas:</span>
                                    <span>{kitnet.vagas}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="font-medium">Tamanho:</span>
                                    <span>{kitnet.tamanho ? `${kitnet.tamanho} m²` : 'N/A'}</span>
                                </li>
                                {/* Adicione mais campos conforme a API retornar */}
                            </ul>
                            
                            <button className="w-full mt-6 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition shadow-md hover:shadow-lg">
                                Entrar em Contato
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Imagem (Lightbox) */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-4 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <button 
                        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2 bg-black bg-opacity-50 rounded-full"
                        onClick={closeModal}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={selectedImage} 
                            alt="Visualização ampliada" 
                            className="max-w-screen max-h-screen object-contain rounded-md shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </main>
    );
}