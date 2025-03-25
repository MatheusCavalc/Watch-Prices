<template>
  <div>
    <h1>Consulta CNPJ</h1>
    <input v-model="cnpj" placeholder="Digite o CNPJ" />
    <button @click="consultarCNPJ">Consultar</button>

    <p v-if="status">Status: {{ situacao['tdContent'] }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const cnpj = ref('');
const status = ref(null);
const url = ref('');
const situacao = ref('')

const consultarCNPJ = async () => {
  try {
    // Realiza a consulta para o backend
    const response = await fetch(`/api/sintegra?query=${encodeURIComponent(cnpj.value)}`);

    // Verifica se a resposta foi ok
    if (response.ok) {
      const data = await response.json();
      console.log('Resposta da API:', data);
      situacao.value = data


      // Define os valores para exibir na interface
      status.value = 'CNPJ consultado com sucesso!';
      url.value = `https://www.exemplo.com/cnpj/${data.query}`; // ou o que você quiser exibir
    } else {
      throw new Error('Falha ao consultar o CNPJ');
    }
  } catch (error) {
    console.error('Erro na consulta:', error);
    status.value = 'Erro ao consultar o CNPJ';
  }
};
</script>
