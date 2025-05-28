<template>
	<h1 class="mb-4 text-lg font-semibold italic">Stories Detail</h1>
	<div class="flex flex-col gap-4">
		<p class="text-lg">{{ video?.title ?? "-" }}</p>
		<div class="w-full h-auto flex items-center justify-center">
			<img
				class="w-full max-w-sm aspect-[9/16] object-cover rounded-2xl"
				:src="video?.thumbnail || ''"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { IVideo } from "../../types/common";
import MOCK_API from "../../mocks/common";
import { useRoute } from "vue-router";

const route = useRoute();
const video = computed<IVideo | undefined>(() => {
	const id = +route.params.id;
	return MOCK_API.find((video) => video.id === id);
});
</script>

<style lang="css"></style>
