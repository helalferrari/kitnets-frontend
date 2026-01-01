'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { fetchAddressByCep } from '@/services/cepService';

export default function EditarKitnet() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true); // Loading inicial do fetch
    const [saving, setSaving] = useState(false); // Loading do salvar
    const [cepLoading, setCepLoading] = useState(false);
    const [cepError, setCepError] = useState('');

    const [formData, setFormData] = useState({
        nome: '',
        valor: '',
        vagas: '',
        taxa: '',
        descricao: '',
        cep: '',
        logradouro: '',
        complement: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        latitude: null,
        longitude: null
    });

    // --- 1. Autenticação e Fetch de Dados ---
    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const token = localStorage.getItem('token');
            const userStored = localStorage.getItem('user');
            const user = userStored ? JSON.parse(userStored) : null;

            if (!token || !user || user.role !== 'LANDLORD') {
                router.push('/login');
                return;
            }

            setIsAuthorized(true);

            try {
                // Busca os dados da kitnet para preencher o form
                const response = await fetch(`http://localhost:8080/api/kitnets/${id}`);
                
                if (!response.ok) {
                    alert('Erro ao buscar dados da kitnet.');
                    router.push('/admin/kitnets');
                    return;
                }

                const data = await response.json();
                
                // Preenche o formulário
                setFormData({
                    nome: data.nome,
                    valor: data.valor,
                    vagas: data.vagas,
                    taxa: data.taxa,
                    descricao: data.descricao,
                    cep: data.cep || '',
                    logradouro: data.logradouro || '',
                    complement: data.complement || '',
                    number: data.number || '',
                    neighborhood: data.neighborhood || '',
                    city: data.city || '',
                    state: data.state || '',
                    latitude: data.latitude || null,
                    longitude: data.longitude || null
                });

            } catch (error) {
                console.error("Erro ao carregar kitnet:", error);
                alert("Erro ao conectar com o servidor.");
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndFetch();
    }, [id, router]);

    if (!isAuthorized) return null;

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-500">Carregando dados...</p>
        </div>
    );

    const maskCep = (value) => {
        return value
            .replace(/\D/g, '') // Remove tudo que não é dígito
            .replace(/^(\d{5})(\d)/, '$1-$2') // Coloca o traço
            .substring(0, 9); // Limita o tamanho
    };

    const handleCepChange = async (value) => {
        const maskedCep = maskCep(value);
        setFormData(prev => ({ ...prev, cep: maskedCep }));
        setCepError(''); // Limpa erro ao digitar

        const cleanCep = maskedCep.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            setCepLoading(true);
            try {
                const addressData = await fetchAddressByCep(cleanCep);
                setFormData(prev => ({
                    ...prev,
                    logradouro: addressData.street || prev.logradouro,
                    neighborhood: addressData.neighborhood || prev.neighborhood,
                    city: addressData.city || prev.city,
                    state: addressData.state || prev.state,
                    latitude: addressData.location?.coordinates?.latitude || null,
                    longitude: addressData.location?.coordinates?.longitude || null
                }));
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
                setCepError("CEP não encontrado ou inválido.");
            } finally {
                setCepLoading(false);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'cep') {
            handleCepChange(value);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const token = localStorage.getItem('token');

        try {
            // O endpoint PUT espera um JSON puro, não FormData
            const response = await fetch(`http://localhost:8080/api/kitnets/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nome: formData.nome,
                    valor: parseFloat(formData.valor),
                    vagas: parseInt(formData.vagas),
                    taxa: parseFloat(formData.taxa),
                    descricao: formData.descricao,
                    cep: formData.cep,
                    logradouro: formData.logradouro,
                    complement: formData.complement,
                    number: formData.number,
                    neighborhood: formData.neighborhood,
                    city: formData.city,
                    state: formData.state,
                    lat: formData.latitude,
                    long: formData.longitude
                })
            });

            if (response.ok) {
                alert('Kitnet atualizada com sucesso!');
                router.push('/admin/kitnets');
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(`Erro ao atualizar: ${errorData.mensagem || response.statusText}`);
            }

        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão com o servidor.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Navbar />

            <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10 border border-gray-200">

                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Editar Kitnet</h1>

                    <button
                        onClick={() => router.push('/admin/kitnets')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex items-center gap-2 border border-gray-300"
                    >
                        <span>⬅</span> Cancelar
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* SEÇÃO 1: Dados da Kitnet */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-yellow-600 flex items-center gap-2">
                            ✏️ Editar Informações
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Nome do Anúncio</label>
                                <input type="text" name="nome" required
                                       value={formData.nome}
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Valor (R$)</label>
                                <input type="number" name="valor" step="0.01" required
                                       value={formData.valor}
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Vagas</label>
                                <input type="number" name="vagas" required
                                       value={formData.vagas}
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Taxa de Condomínio (R$)</label>
                                <input type="number" name="taxa" step="0.01" required
                                       value={formData.taxa}
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">Descrição</label>
                            <textarea name="descricao" rows="4"
                                      value={formData.descricao}
                                      className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                      onChange={handleChange}></textarea>
                        </div>
                    </div>

                    {/* SEÇÃO 1.5: Endereço */}
                    <div className="space-y-4 border-t pt-6">
                        <h2 className="text-lg font-bold text-yellow-600 flex items-center gap-2">
                            📍 Endereço
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">
                                    CEP {cepLoading && <span className="text-blue-500 text-xs animate-pulse">(Buscando...)</span>}
                                </label>
                                <input type="text" name="cep" required
                                       value={formData.cep}
                                       placeholder="00000-000"
                                       className={`mt-1 block w-full border ${cepError ? 'border-red-500' : 'border-gray-300'} rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all`}
                                       onChange={handleChange} />
                                {cepError && <p className="text-red-500 text-xs mt-1">{cepError}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-900 mb-1">Logradouro</label>
                                <input type="text" name="logradouro" required
                                       value={formData.logradouro}
                                       placeholder="Rua, Avenida..."
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Número</label>
                                <input type="text" name="number"
                                       value={formData.number}
                                       placeholder="123"
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-900 mb-1">Complemento</label>
                                <input type="text" name="complement"
                                       value={formData.complement}
                                       placeholder="Apto 101, Bloco B..."
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Bairro</label>
                                <input type="text" name="neighborhood" required
                                       value={formData.neighborhood}
                                       placeholder="Centro"
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Cidade</label>
                                <input type="text" name="city" required
                                       value={formData.city}
                                       placeholder="Florianópolis"
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Estado (UF)</label>
                                <input type="text" name="state" required maxLength="2"
                                       value={formData.state}
                                       placeholder="SC"
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all uppercase"
                                       onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-sm text-yellow-800">
                        <strong>Nota:</strong> A edição de fotos ainda não está disponível. Caso precise alterar as imagens, exclua o anúncio e crie um novo.
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className={`w-full py-3.5 px-4 rounded-lg text-white font-bold text-lg shadow-md transition-all transform hover:-translate-y-0.5 ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700 hover:shadow-lg'}`}
                    >
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </form>
            </div>
        </div>
    );
}