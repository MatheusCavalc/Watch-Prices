<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-semibold text-center text-gray-700 mb-6">Consulta CNPJ</h1>

    <div class="flex justify-center mb-4">
      <input v-model="cnpj" type="text" placeholder="Digite o CNPJ"
        class="px-4 py-2 border border-gray-300 rounded-lg w-1/2 max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      <button @click="consultarCNPJ"
        class="ml-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
        Consultar
      </button>
    </div>

    <!-- Exibe o status da operação (erro ou sucesso) -->
    <p v-if="status" :style="statusStyle" class="text-center font-semibold mb-4">
      {{ status }}
    </p>

    <!-- Exibe os resultados se houver -->
    <div v-if="resultados.length > 0" class="space-y-4">
      <div v-for="(item, index) in resultados" :key="index" class="p-4 border border-gray-300 rounded-lg shadow-sm">
        <h3 class="text-lg font-medium text-gray-800">{{ item.nome }}</h3>
        <p class="text-sm text-gray-600">CNPJ: {{ item.cnpj }}</p>
        <p class="text-sm text-gray-500">Situação: <span class="font-semibold text-green-600">{{ item.tdContent
            }}</span></p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

const cnpj = ref('');
const status = ref(null);
const situacao = ref(null);
const statusStyle = ref({});  // Para mudar o estilo do status (vermelho para erro, verde para sucesso)

const resultados = ref([]);

// Função para consultar o CNPJ
const consultarCNPJ = async () => {
  try {
    // Realiza a consulta para o backend
    const response = await fetch(`/api/sintegra?query=${cnpj.value}`);

    // Verifica se a resposta foi ok
    if (response.ok) {
      const data = await response.json();
      console.log('Resposta da API:', data);
      resultados.value = data.results;  // Atribui os resultados

      // Verifica se a resposta contém os dados esperados
      if (data.results && data.results.length > 0) {
        status.value = 'CNPJ consultado com sucesso!';
        statusStyle.value = { color: 'green' };
      } else {
        status.value = 'Nenhuma informação encontrada para o CNPJ.';
        statusStyle.value = { color: 'red' };
      }

    } else {
      // Se a resposta não for ok, exibe um erro
      throw new Error('Falha ao consultar o CNPJ');
    }
  } catch (error) {
    console.error('Erro na consulta:', error);
    status.value = `Erro: ${error.message}`;
    statusStyle.value = { color: 'red' };
  }
};
</script>
