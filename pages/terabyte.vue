<template>
    <div>
        <h1>Buscar Produtos Terabyte</h1>

        <!-- Campo de busca -->
        <input v-model="searchQuery" placeholder="Digite o nome do produto" />

        <!-- Botão de busca -->
        <button @click="searchProducts">Buscar</button>

        <h2>Resultados Exatos</h2>
        <ul>
            <li v-for="(product, index) in exactMatches" :key="index">
                <p>{{ product.title }} - <span v-if="product.price">{{ product.price }}</span> <span v-else>Indisponivel</span> - {{ product.site }}</p>
            </li>
        </ul>

        <h2>Outras Opções</h2>
        <ul>
            <li v-for="(product, index) in otherOptions" :key="index">
                <p>{{ product.title }} - <span v-if="product.price">{{ product.price }}</span> <span v-else>Indisponivel</span> - {{ product.site }}</p>
            </li>
        </ul>
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
    const response = await fetch(`/api/terabyte?query=${encodeURIComponent(searchQuery.value)}`);
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