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
        name: '',
        value: '',
        description: '',
        area: '',
        floor: '',
        status: 'AVAILABLE',
        conciergeType: 'NONE',
        lockType: 'KEY',
        furnished: false,
        petsAllowed: false,
        bathroomType: 'PRIVATIVO',
        amenities: [],
        cep: '',
        street: '',
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
                    name: data.name,
                    value: data.value,
                    description: data.description,
                    area: data.area || '',
                    floor: data.floor || '',
                    status: data.status || 'AVAILABLE',
                    conciergeType: data.conciergeType || 'NONE',
                    lockType: data.lockType || 'KEY',
                    furnished: data.furnished || false,
                    petsAllowed: data.petsAllowed || false,
                    bathroomType: data.bathroomType || 'PRIVATIVO',
                    amenities: data.amenities || [],
                    cep: data.cep || '',
                    street: data.street || '',
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
                    street: addressData.street || prev.street,
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
                    name: formData.name,
                    value: parseFloat(formData.value),
                    description: formData.description,
                    area: parseFloat(formData.area || 0),
                    floor: formData.floor ? parseInt(formData.floor) : null,
                    status: formData.status,
                    conciergeType: formData.conciergeType,
                    lockType: formData.lockType,
                    furnished: formData.furnished,
                    petsAllowed: formData.petsAllowed,
                    bathroomType: formData.bathroomType,
                    amenities: formData.amenities,
                    cep: formData.cep,
                    street: formData.street,
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
                                <input type="text" name="name" required
                                       value={formData.name}
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Valor (R$)</label>
                                <input type="number" name="value" step="0.01" required
                                       value={formData.value}
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">Situação do Imóvel</label>
                            <select name="status"
                                    value={formData.status}
                                    className={`mt-1 block w-full border rounded-md p-2.5 text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all font-bold ${formData.status === 'AVAILABLE' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}
                                    onChange={handleChange}>
                                <option value="AVAILABLE" className="bg-white text-gray-900">🟢 Disponível</option>
                                <option value="RENTED" className="bg-white text-gray-900">🔴 Alugada</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Área (m²)</label>
                                <input type="number" name="area" step="0.01"
                                       value={formData.area}
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Andar</label>
                                <input type="number" name="floor"
                                       value={formData.floor}
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Tipo de Fechadura</label>
                                <select name="lockType"
                                        value={formData.lockType}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                        onChange={handleChange}>
                                    <option value="KEY">Chave</option>
                                    <option value="PASSWORD">Senha</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Tipo de Banheiro</label>
                                <select name="bathroomType"
                                        value={formData.bathroomType}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                        onChange={handleChange}>
                                    <option value="PRIVATIVO">Privativo</option>
                                    <option value="COMPARTILHADO">Compartilhado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Portaria</label>
                                <select name="conciergeType"
                                        value={formData.conciergeType}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                        onChange={handleChange}>
                                    <option value="NONE">Sem Portaria</option>
                                    <option value="TWENTY_FOUR_HOURS">24 Horas</option>
                                    <option value="DAYTIME">Diurna</option>
                                    <option value="NIGHTTIME">Noturna</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="furnished"
                                       checked={formData.furnished}
                                       className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                                       onChange={(e) => setFormData(prev => ({...prev, furnished: e.target.checked}))} />
                                <span className="text-gray-900 font-medium">Mobiliado</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="petsAllowed"
                                       checked={formData.petsAllowed}
                                       className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                                       onChange={(e) => setFormData(prev => ({...prev, petsAllowed: e.target.checked}))} />
                                <span className="text-gray-900 font-medium">Aceita Pets</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">Comodidades</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {['WIFI', 'AR_CONDICIONADO', 'LAVANDERIA', 'PORTARIA', 'ACADEMIA', 'CHURRASQUEIRA', 'MOBILIA_COMPLETA', 'PISCINA'].map((amenity) => (
                                    <label key={amenity} className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded border border-gray-200 hover:bg-gray-100">
                                        <input type="checkbox"
                                               value={amenity}
                                               checked={formData.amenities.includes(amenity)}
                                               onChange={(e) => {
                                                   const { checked, value } = e.target;
                                                   setFormData(prev => {
                                                       const newAmenities = checked
                                                           ? [...prev.amenities, value]
                                                           : prev.amenities.filter(a => a !== value);
                                                       return { ...prev, amenities: newAmenities };
                                                   });
                                               }}
                                               className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500" />
                                        <span className="text-xs font-medium text-gray-700">{amenity.replace('_', ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">Descrição</label>
                            <textarea name="description" rows="4"
                                      value={formData.description}
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
                                <input type="text" name="street" required
                                       value={formData.street}
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