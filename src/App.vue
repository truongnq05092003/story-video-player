<template>
	<div class="my-10">
		<div class="w-full max-w-[calc(100%-32px)] md:max-w-[900px] mx-4 md:mx-auto">
			<h1 class="mb-4 text-lg font-semibold italic">Story Demo</h1>
			<Stories :videos="videos" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { IVideo } from "./types/common";
import Stories from "./components/stories/index.vue";

const videos = ref<IVideo[]>(
	[
		"https://flipfit-cdn.akamaized.net/flip_hls/6656423247ffe600199e8363-15125d/video_h1.m3u8",
		"https://flipfit-cdn.akamaized.net/flip_hls/662aae7a42cd740019b91dec-3e114f/video_h1.m3u8",
		"https://flipfit-cdn.akamaized.net/flip_hls/663e5a1542cd740019b97dfa-ccf0e6/video_h1.m3u8",
		"https://flipfit-cdn.akamaized.net/flip_hls/6656423247ffe600199e8363-15125d/video_h1.m3u8",
		"https://flipfit-cdn.akamaized.net/flip_hls/664d87dfe8e47500199ee49e-dbd56b/video_h1.m3u8",
	].map((src, index) => ({
		id: index + 1,
		title: `Story ${index + 1}`,
		src,
		thumbnail: `https://placehold.co/300x533?text=Story+${index + 1}`,
	}))
);
</script>
