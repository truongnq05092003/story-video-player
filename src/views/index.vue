<template>
	<h1 class="mb-4 text-lg font-semibold italic">Stories Demo</h1>
	<Stories :videos="videos" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { IVideo } from "../types/common";
import Stories from "../components/stories/index.vue";
import MOCK_API from "../mocks/common";

const videos = ref<IVideo[]>(MOCK_API);
</script>
