'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const userStored = localStorage.getItem('user');
        if (userStored) {
            setUser(JSON.parse(userStored));
        }
    }, []);

    // Fecha o menu sempre que a rota mudar
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <header className="fixed top-0 left-0 w-full bg-white shadow-md z-40">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo e Menu Sanduíche */}
                <div className="flex items-center gap-4">
                    {/* Botão Sanduíche (Mobile e Desktop) */}
                    {user && user.role === 'LANDLORD' && (
                        <button 
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="text-gray-600 hover:text-blue-600 focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    )}

                    <Link href="/" className="text-2xl font-bold text-blue-600">
                        Kitnets
                    </Link>
                </div>

                {/* Menu da Direita (Desktop) */}
                <nav className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="text-gray-600 hidden md:inline">
                                Olá, <strong>{user.name}</strong>
                            </span>

                            {user.role === 'LANDLORD' && (
                                <Link
                                    href="/anunciar"
                                    className="hidden md:flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    <span className="hidden sm:inline">Anunciar</span>
                                </Link>
                            )}

                            <button
                                onClick={handleLogout}
                                className="text-red-600 hover:text-red-800 font-medium text-sm border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Entrar / Cadastrar
                        </Link>
                    )}
                </nav>
            </div>

            {/* Menu Lateral (Drawer) */}
            {menuOpen && user && user.role === 'LANDLORD' && (
                <>
                    {/* Overlay para fechar ao clicar fora */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-50"
                        onClick={() => setMenuOpen(false)}
                    ></div>

                    {/* Conteúdo do Menu */}
                    <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-xl z-[60] transform transition-transform duration-300 ease-in-out">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                            <button onClick={() => setMenuOpen(false)} className="text-gray-500 hover:text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <nav className="p-4 space-y-2">
                            <Link 
                                href="/admin/kitnets" 
                                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                            >
                                🏠 Minhas Kitnets
                            </Link>
                            <Link 
                                href="/anunciar" 
                                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                            >
                                ➕ Novo Anúncio
                            </Link>
                            <hr className="my-2 border-gray-100" />
                            <Link 
                                href="/" 
                                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                            >
                                🔍 Voltar para a Busca
                            </Link>
                        </nav>
                    </div>
                </>
            )}
        </header>
    );
}