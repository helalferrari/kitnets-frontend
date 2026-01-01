'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function CadastrarKitnet() {
    const router = useRouter();

    // --- NOVA TRAVA DE SEGURANÇA ---
    // Começa como false para NÃO mostrar nada até verificarmos
    const [isAuthorized, setIsAuthorized] = useState(false);
    // -------------------------------

    const [loading, setLoading] = useState(false);
    const [previews, setPreviews] = useState([]);

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
        state: ''
    });

    const [files, setFiles] = useState([]);

    // --- LÓGICA DE PROTEÇÃO DA PÁGINA ---
    useEffect(() => {
        // 1. Pega o usuário
        const userStored = localStorage.getItem('user');
        const user = userStored ? JSON.parse(userStored) : null;

        // 2. Verifica permissão
        if (!user || user.role !== 'LANDLORD') {
            // Se não for Landlord, joga para a Home imediatamente
            router.push('/');
        } else {
            // 3. Se for Landlord, LIBERA a visualização
            setIsAuthorized(true);
        }
    }, [router]);

    // --- BLOQUEIO DE RENDERIZAÇÃO ---
    // Se não estiver autorizado ainda, retorna NULL (tela em branco)
    // Isso impede que um usuário deslogado veja o formulário "de relance"
    if (!isAuthorized) {
        return null;
    }
    // --------------------------------

    const maskCep = (value) => {
        return value
            .replace(/\D/g, '') // Remove tudo que não é dígito
            .replace(/^(\d{5})(\d)/, '$1-$2') // Coloca o traço
            .substring(0, 9); // Limita o tamanho
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'cep') {
            setFormData(prev => ({ ...prev, [name]: maskCep(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            const MAX_SIZE = 15 * 1024 * 1024; // 15MB

            const arquivoGigante = selectedFiles.find(file => file.size > MAX_SIZE);

            if (arquivoGigante) {
                alert(`O arquivo "${arquivoGigante.name}" é muito grande! O limite é de 15MB por arquivo.`);
                e.target.value = "";
                setFiles([]);
                setPreviews([]);
                return;
            }

            setFiles(selectedFiles);
            const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviews(newPreviews);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const dataToSend = new FormData();

            const kitnetJson = {
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
                state: formData.state
            };

            dataToSend.append('kitnet', new Blob([JSON.stringify(kitnetJson)], {
                type: 'application/json'
            }));

            files.forEach(file => {
                dataToSend.append('files', file);
            });

            const response = await fetch('http://localhost:8080/api/kitnets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: dataToSend,
            });

            if (response.ok) {
                alert('Kitnet cadastrada com sucesso!');
                router.push('/');
            } else {
                let errorData = {};
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    console.warn("Resposta de erro não é JSON válido.");
                }

                if (response.status === 413) {
                    const msg = errorData.mensagem || "Os arquivos são muito grandes.";
                    alert(`⚠️ Atenção: ${msg}`);
                } else if (response.status === 403) {
                    alert("Erro: Você não tem permissão para realizar esta ação.");
                } else {
                    const msg = errorData.mensagem || "Erro ao cadastrar. Verifique os dados.";
                    alert(`Erro: ${msg}`);
                }
            }

        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Navbar />

            <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10 border border-gray-200">

                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Anunciar Nova Kitnet</h1>

                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex items-center gap-2 border border-gray-300"
                    >
                        <span>⬅</span> Voltar
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* SEÇÃO 1: Dados da Kitnet */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                            🏠 Dados do Imóvel
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Nome do Anúncio</label>
                                <input type="text" name="nome" required
                                       placeholder="Ex: Kitnet na Trindade"
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Valor (R$)</label>
                                <input type="number" name="valor" step="0.01" required
                                       placeholder="0,00"
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Vagas</label>
                                <input type="number" name="vagas" required
                                       placeholder="1"
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Taxa de Condomínio (R$)</label>
                                <input type="number" name="taxa" step="0.01" required
                                       placeholder="0,00"
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">Descrição</label>
                            <textarea name="descricao" rows="4"
                                      placeholder="Descreva os detalhes do imóvel..."
                                      className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                      onChange={handleChange}></textarea>
                        </div>
                    </div>

                    {/* SEÇÃO 1.5: Endereço */}
                    <div className="space-y-4 border-t pt-6">
                        <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                            📍 Endereço
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">CEP</label>
                                <input type="text" name="cep" required
                                       value={formData.cep}
                                       placeholder="00000-000"
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-900 mb-1">Logradouro</label>
                                <input type="text" name="logradouro" required
                                       placeholder="Rua, Avenida..."
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Número</label>
                                <input type="text" name="number"
                                       placeholder="123"
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-900 mb-1">Complemento</label>
                                <input type="text" name="complement"
                                       placeholder="Apto 101, Bloco B..."
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Bairro</label>
                                <input type="text" name="neighborhood" required
                                       placeholder="Centro"
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Cidade</label>
                                <input type="text" name="city" required
                                       placeholder="Florianópolis"
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                       onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Estado (UF)</label>
                                <input type="text" name="state" required maxLength="2"
                                       placeholder="SC"
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase"
                                       onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 2: Fotos */}
                    <div className="space-y-4 border-t pt-6">
                        <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                            📷 Galeria de Fotos
                        </h2>

                        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center hover:bg-gray-100 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="text-gray-600">
                                <span className="text-blue-600 font-bold hover:underline">Clique para selecionar</span> ou arraste as fotos aqui
                                <p className="text-xs text-gray-500 mt-1">Máximo 15MB por arquivo</p>
                            </div>
                        </div>

                        {files.length > 0 && (
                            <div className="text-sm text-gray-600 font-medium">
                                {files.length} arquivo(s) selecionado(s)
                            </div>
                        )}

                        <div className="flex gap-3 overflow-x-auto py-2">
                            {previews.map((src, index) => (
                                <img key={index} src={src} alt="Preview" className="h-24 w-24 object-cover rounded-lg border border-gray-300 shadow-sm" />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 px-4 rounded-lg text-white font-bold text-lg shadow-md transition-all transform hover:-translate-y-0.5 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'}`}
                    >
                        {loading ? 'Enviando...' : 'Cadastrar Kitnet'}
                    </button>
                </form>
            </div>
        </div>
    );
}