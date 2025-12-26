'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    // Verifica se o usuário está logado ao carregar a página
    useEffect(() => {
        const userStored = localStorage.getItem('user');
        if (userStored) {
            setUser(JSON.parse(userStored));
        }
    }, []);

    // Função de Logout Completa
    const handleLogout = () => {
        // Limpa tudo
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Reseta estado local
        setUser(null);

        // Redireciona para login
        router.push('/login');
    };

    return (
        <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="text-2xl font-bold text-blue-600">
                    Kitnets
                </Link>

                {/* Menu da Direita */}
                <nav className="flex items-center gap-4">
                    {user ? (
                        <>
                            {/* Saudação */}
                            <span className="text-gray-600 hidden md:inline">
                                Olá, <strong>{user.name}</strong>
                            </span>

                            {/* Botão de Cadastrar - SÓ APARECE PARA LANDLORD */}
                            {user.role === 'LANDLORD' && (
                                <Link
                                    href="/anunciar"
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    <span className="hidden sm:inline">Anunciar Kitnet</span>
                                </Link>
                            )}

                            {/* Botão de Sair */}
                            <button
                                onClick={handleLogout}
                                className="text-red-600 hover:text-red-800 font-medium text-sm border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        // Se NÃO estiver logado
                        <Link
                            href="/login"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Entrar / Cadastrar
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}