'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterUser() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        cpf: '',
        phone: '',
        role: 'TENANT' // Valor padrão
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert("Conta criada com sucesso! Faça login para continuar.");
                router.push('/login'); // Redireciona para o login
            } else {
                // Tenta pegar mensagem de erro do backend se houver
                const data = await response.json().catch(() => ({}));
                setError(data.message || "Erro ao criar conta. Verifique os dados (Email já existe?).");
            }
        } catch (err) {
            console.error(err);
            setError("Erro de conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Crie sua Conta</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Nome Completo */}
                    <div>
                        <label className="block text-gray-900 text-sm font-bold mb-1">Nome Completo</label>
                        <input type="text" name="name" required onChange={handleChange}
                               className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white text-gray-900"
                               placeholder="Seu Nome" />
                    </div>

                    {/* Email e Senha */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-900 text-sm font-bold mb-1">Email</label>
                            <input type="email" name="email" required onChange={handleChange}
                                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white text-gray-900"
                                   placeholder="email@exemplo.com" />
                        </div>
                        <div>
                            <label className="block text-gray-900 text-sm font-bold mb-1">Senha</label>
                            <input type="password" name="password" required onChange={handleChange}
                                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white text-gray-900"
                                   placeholder="******" />
                        </div>
                    </div>

                    {/* CPF e Telefone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-900 text-sm font-bold mb-1">CPF</label>
                            <input type="text" name="cpf" required onChange={handleChange}
                                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white text-gray-900"
                                   placeholder="000.000.000-00" />
                        </div>
                        <div>
                            <label className="block text-gray-900 text-sm font-bold mb-1">Telefone</label>
                            <input type="text" name="phone" required onChange={handleChange}
                                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white text-gray-900"
                                   placeholder="(00) 00000-0000" />
                        </div>
                    </div>

                    {/* Seleção de Perfil (Role) */}
                    <div>
                        <label className="block text-gray-900 text-sm font-bold mb-2">Eu sou:</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg w-full hover:bg-gray-50">
                                <input type="radio" name="role" value="TENANT"
                                       checked={formData.role === 'TENANT'} onChange={handleChange}
                                       className="accent-blue-600 w-5 h-5" />
                                <span className="text-gray-800 font-medium">Inquilino (Quero alugar)</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg w-full hover:bg-gray-50">
                                <input type="radio" name="role" value="LANDLORD"
                                       checked={formData.role === 'LANDLORD'} onChange={handleChange}
                                       className="accent-blue-600 w-5 h-5" />
                                <span className="text-gray-800 font-medium">Proprietário (Quero anunciar)</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                            className={`w-full text-white font-bold py-3 px-4 rounded-lg transition duration-300 ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
                        {loading ? 'Criando Conta...' : 'Cadastrar'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Já tem uma conta?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline font-bold">
                        Faça Login
                    </Link>
                </p>
            </div>
        </div>
    );
}