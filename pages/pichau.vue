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
    <h2 class="text-xl font-semibold mt-6 mb-2">Resultados Exatos</h2>
    <table class="min-w-full border-collapse">
      <thead>
        <tr class="bg-gray-100">
          <th class="py-2 px-4 text-left border-b">Título</th>
          <th class="py-2 px-4 text-left border-b">Preço</th>
          <th class="py-2 px-4 text-left border-b">Site</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(product, index) in exactMatches" :key="index" class="border-b">
          <td class="py-2 px-4">{{ product.title }}</td>
          <td class="py-2 px-4">
            <span v-if="product.price.includes('por')">{{ product.realPrice }}</span>
            <span v-else>{{ product.price }}</span>
          </td>
          <td class="py-2 px-4">{{ product.site }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Outras Opções -->
    <h2 class="text-xl font-semibold mt-6 mb-2">Outras Opções</h2>
    <table class="min-w-full border-collapse">
      <thead>
        <tr class="bg-gray-100">
          <th class="py-2 px-4 text-left border-b">Título</th>
          <th class="py-2 px-4 text-left border-b">Preço</th>
          <th class="py-2 px-4 text-left border-b">Site</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(product, index) in otherOptions" :key="index" class="border-b">
          <td class="py-2 px-4">{{ product.title }}</td>
          <td class="py-2 px-4">
            <span v-if="product.price.includes('por')">{{ product.realPrice }}</span>
            <span v-else>{{ product.price }}</span>
          </td>
          <td class="py-2 px-4">{{ product.site }}</td>
        </tr>
      </tbody>
    </table>
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
  const response = await fetch(`/api/pichau?query=${encodeURIComponent(searchQuery.value)}`);
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