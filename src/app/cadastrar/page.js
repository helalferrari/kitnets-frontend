'use client'; // Necessário pois usa useState e eventos de formulário

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastrarKitnet() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [previews, setPreviews] = useState([]); // Para mostrar miniaturas das fotos

    // Estado único para todos os campos de texto
    const [formData, setFormData] = useState({
        nome: '',
        valor: '',
        vagas: '',
        taxa: '',
        descricao: '',
        landlordName: '',  // Campos do Proprietário
        landlordEmail: ''
    });

    // Estado separado para os arquivos
    const [files, setFiles] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);

            // --- NOVA VALIDAÇÃO DE TAMANHO ---
            const MAX_SIZE = 15 * 1024 * 1024; // 10MB em bytes

            // Verifica se algum arquivo ultrapassa o limite
            const arquivoGigante = selectedFiles.find(file => file.size > MAX_SIZE);

            if (arquivoGigante) {
                alert(`O arquivo "${arquivoGigante.name}" é muito grande! O limite é de 10MB por arquivo.`);

                // Limpa o input para permitir selecionar de novo
                e.target.value = "";
                // Opcional: Limpar o estado ou manter os arquivos anteriores válidos
                // Aqui estou limpando tudo para forçar uma seleção válida
                setFiles([]);
                setPreviews([]);
                return; // Para a execução aqui, não atualiza o estado
            }
            // ---------------------------------

            setFiles(selectedFiles);

            // Gera URLs temporárias para mostrar preview
            const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviews(newPreviews);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Cria o objeto FormData
            const dataToSend = new FormData();

            // 2. Prepara o JSON da Kitnet
            const kitnetJson = {
                nome: formData.nome,
                valor: parseFloat(formData.valor),
                vagas: parseInt(formData.vagas),
                taxa: parseFloat(formData.taxa),
                descricao: formData.descricao,
                landlord: {
                    name: formData.landlordName,
                    email: formData.landlordEmail
                }
            };

            // 3. Adiciona o JSON como um Blob
            dataToSend.append('kitnet', new Blob([JSON.stringify(kitnetJson)], {
                type: 'application/json'
            }));

            // 4. Adiciona as fotos
            files.forEach(file => {
                dataToSend.append('files', file);
            });

            // 5. Envia para o Backend
            const response = await fetch('http://localhost:8080/api/kitnets', {
                method: 'POST',
                body: dataToSend,
            });

            if (response.ok) {
                alert('Kitnet cadastrada com sucesso!');
                router.push('/'); // Volta para a home
            } else {
                // --- INICIO DA ALTERAÇÃO: TRATAMENTO DE ERRO ---

                // Tenta ler o corpo da resposta como JSON
                let errorData = {};
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    console.warn("Resposta de erro não é JSON válido.");
                }

                // Verifica se é o erro de tamanho (413 Payload Too Large)
                if (response.status === 413) {
                    // Usa a mensagem vinda do Java ou um fallback
                    const msg = errorData.mensagem || "Os arquivos são muito grandes. Tente enviar arquivos menores.";
                    alert(`⚠️ Atenção: ${msg}`);
                }
                else {
                    // Outros erros (400 Bad Request, 500 Internal Error, etc)
                    const msg = errorData.mensagem || "Erro ao cadastrar. Verifique os dados.";
                    alert(`Erro: ${msg}`);
                }
                // --- FIM DA ALTERAÇÃO ---
            }

        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão com o servidor. Verifique se a API está rodando.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Cadastrar Nova Kitnet</h1>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* SEÇÃO 1: Dados da Kitnet */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-blue-600">🏠 Dados do Imóvel</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome do Anúncio</label>
                            <input type="text" name="nome" required
                                   className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                   onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                            <input type="number" name="valor" step="0.01" required
                                   className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                   onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Vagas</label>
                            <input type="number" name="vagas" required
                                   className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                   onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Taxa de Condomínio (R$)</label>
                            <input type="number" name="taxa" step="0.01" required
                                   className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                   onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea name="descricao" rows="3"
                                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                  onChange={handleChange}></textarea>
                    </div>
                </div>

                {/* SEÇÃO 2: Proprietário */}
                <div className="space-y-4 border-t pt-4">
                    <h2 className="text-lg font-semibold text-blue-600">👤 Dados do Proprietário</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                            <input type="text" name="landlordName" required
                                   className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                   onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="landlordEmail" required
                                   className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                   onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* SEÇÃO 3: Fotos */}
                <div className="space-y-4 border-t pt-4">
                    <h2 className="text-lg font-semibold text-blue-600">📷 Galeria de Fotos</h2>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />

                    {/* Preview das imagens */}
                    <div className="flex gap-2 overflow-x-auto py-2">
                        {previews.map((src, index) => (
                            <img key={index} src={src} alt="Preview" className="h-20 w-20 object-cover rounded-md border" />
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-md text-white font-bold transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {loading ? 'Enviando...' : 'Cadastrar Kitnet'}
                </button>
            </form>
        </div>
    );
}