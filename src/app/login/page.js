'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');

    // --- CORREÇÃO DO LOOP (FIX) ---
    // Assim que a tela de Login carrega, limpamos qualquer resquício de sessão anterior.
    // Isso impede que o sistema "ache" que você está logado e te jogue para a Home.
    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Dispara um evento para atualizar o Navbar imediatamente (sumir com o "Olá, Fulano")
        window.dispatchEvent(new Event("storage"));
    }, []);
    // ------------------------------

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();

                // 1. Salva o novo Token
                localStorage.setItem('token', data.token);

                // 2. Salva o novo Usuário
                const userData = {
                    name: data.name,
                    role: data.role
                };
                localStorage.setItem('user', JSON.stringify(userData));

                // 3. Atualiza o Navbar
                window.dispatchEvent(new Event("storage"));

                // 4. Redireciona para a Home
                router.push('/');
            } else {
                setError('Login falhou! Verifique email e senha.');
            }
        } catch (err) {
            console.error(err);
            setError('Erro de conexão com o servidor.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Acesse sua Conta</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-900 text-sm font-bold mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 focus:bg-white"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-900 text-sm font-bold mb-2">Senha</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 focus:bg-white"
                            placeholder="********"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
                    >
                        Entrar
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Não tem uma conta?{' '}
                    <Link href="/cadastrar" className="text-blue-600 hover:underline font-bold">
                        Cadastre-se
                    </Link>
                </p>
            </div>
        </div>
    );
}