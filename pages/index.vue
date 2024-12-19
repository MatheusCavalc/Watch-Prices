<script setup>
import { ref, onMounted } from 'vue';

const products = ref([]);

onMounted(async () => {
    const response = await fetch('/api/puppeteer');
    products.value = await response.json();

    console.log(products.value)
});
</script>

<template>
    <div>
        <h1>Produtos</h1>
        <ul>
            <li v-for="(product, index) in products" :key="index">
                <p>{{ product.title }} - {{ product.price }}</p>
            </li>
        </ul>
    </div>
</template>