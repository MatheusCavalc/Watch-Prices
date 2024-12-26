<template>
    <div class="max-w-4xl mx-auto p-6">
        <h1 class="text-2xl font-bold mb-6">Buscar Produtos</h1>

        <!-- Campo de busca -->
        <div class="mb-4 flex items-center">
            <input v-model="searchQuery" placeholder="Digite o nome do produto"
                class="p-2 border border-gray-300 rounded-md w-full" />
            <button @click="searchProducts" class="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Buscar
            </button>
        </div>

        <!-- Resultados Exatos -->
        <h2 class="text-xl font-semibold mt-6 mb-2">Resultados Exatos:</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Produtos -->
            <div v-for="(product, index) in exactMatches" :key="index" class="bg-white border rounded-md p-4 shadow-md">
                <img :src="product.image" alt="Imagem do produto" class="w-full h-48 object-cover rounded-md mb-4" />
                <h3 class="text-lg font-semibold mb-2">{{ product.title }}</h3>

                <p v-if="product.site == 'Kabum'" class="text-xl font-bold text-blue-600 mb-4">{{ product.price }}</p>
                <p v-if="product.site == 'Terabyte'" class="text-xl font-bold text-blue-600 mb-4">
                    <span v-if="product.price">{{ product.price }}</span>
                    <span v-else>Indisponível</span>
                </p>
                <p v-if="product.site == 'Pichau'" class="text-xl font-bold text-blue-600 mb-4">
                    <span v-if="product.price.includes('por')">{{ product.realPrice }}</span>
                    <span v-else>{{ product.price }}</span>
                </p>

                <p class="mb-4 text-gray-600">{{ product.site }}</p>
                <a :href="product.url" target="_blank" class="text-blue-500 hover:text-blue-700 underline">Ver
                    Produto</a>
            </div>
        </div>

        <div class="my-4 h-1 w-full rounded-full bg-blue-500"></div>

        <!-- Outras Opções -->
        <h2 class="text-xl font-semibold mt-6 mb-2">Outras Opções:</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Produtos -->
            <div v-for="(product, index) in otherOptions" :key="index" class="bg-white border rounded-md p-4 shadow-md">
                <img :src="product.image" alt="Imagem do produto" class="w-full h-48 object-cover rounded-md mb-4" />
                <h3 class="text-lg font-semibold mb-2">{{ product.title }}</h3>

                <p v-if="product.site == 'Kabum'" class="text-xl font-bold text-blue-600 mb-4">{{ product.price }}</p>
                <p v-if="product.site == 'Terabyte'" class="text-xl font-bold text-blue-600 mb-4">
                    <span v-if="product.price">{{ product.price }}</span>
                    <span v-else>Indisponível</span>
                </p>
                <p v-if="product.site == 'Pichau'" class="text-xl font-bold text-blue-600 mb-4">
                    <span v-if="product.price.includes('por')">{{ product.realPrice }}</span>
                    <span v-else>{{ product.price }}</span>
                </p>

                <p class="mb-4 text-gray-600">{{ product.site }}</p>
                <a :href="product.url" target="_blank" class="text-blue-500 hover:text-blue-700 underline">Ver
                    Produto</a>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const searchQuery = ref(''); // Valor do campo de busca
const products = ref([]);    // Lista de produtos encontrados

// Função para buscar os produtos com base no nome digitado
const searchProducts = async () => {
    if (searchQuery.value.trim() === '') return; // Se a busca estiver vazia, não faz nada

    // Fazendo a requisição para o backend com o termo de busca
    const response = await fetch(`/api/kabum?query=${encodeURIComponent(searchQuery.value)}`);
    products.value = await response.json();
    console.log(products.value);
};

// Computed para separar os produtos em dois grupos
const exactMatches = computed(() => {
    // Se a pesquisa estiver vazia, retorna todos os produtos como "resultados exatos"
    if (!searchQuery.value.trim()) return products.value;

    // Filtra os produtos que contêm **todos** os termos da pesquisa
    const queryTerms = searchQuery.value.trim().toLowerCase().split(' ');

    return products.value.filter((product) => {
        const title = product.title ? product.title.toLowerCase() : '';
        return queryTerms.every(term => title.includes(term)); // Checa se todos os termos estão no título
    });
});

const otherOptions = computed(() => {
    // Se a pesquisa estiver vazia, retorna uma lista vazia para "outras opções"
    if (!searchQuery.value.trim()) return [];

    // Retorna os produtos que **não contêm todos os termos da pesquisa**
    const queryTerms = searchQuery.value.trim().toLowerCase().split(' ');

    return products.value.filter((product) => {
        const title = product.title ? product.title.toLowerCase() : '';
        return !queryTerms.every(term => title.includes(term)); // Checa se todos os termos não estão no título
    });
});
</script>