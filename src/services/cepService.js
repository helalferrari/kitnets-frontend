/**
 * Service to fetch address information from a CEP.
 * Uses BrasilAPI v2.
 * 
 * @param {string} cep - The CEP to search for (digits only or formatted).
 * @returns {Promise<Object>} - The address data or throws an error.
 */
export async function fetchAddressByCep(cep) {
    // Remove non-digits
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos.');
    }

    try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar CEP.');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro no serviço de CEP:', error);
        throw error;
    }
}
