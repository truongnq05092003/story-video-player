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
		"https://ddjk7crxx6y3u.cloudfront.net/32c6b2ed-0043-4370-9f42-109da365ae66-test-short-video.m3u8",
		"https://ddjk7crxx6y3u.cloudfront.net/32c6b2ed-0043-4370-9f42-109da365ae66-test-short-video.m3u8",
		"https://ddjk7crxx6y3u.cloudfront.net/32c6b2ed-0043-4370-9f42-109da365ae66-test-short-video.m3u8",
		"https://ddjk7crxx6y3u.cloudfront.net/32c6b2ed-0043-4370-9f42-109da365ae66-test-short-video.m3u8",
		"https://ddjk7crxx6y3u.cloudfront.net/32c6b2ed-0043-4370-9f42-109da365ae66-test-short-video.m3u8",
	].map((src, index) => ({
		id: index + 1,
		title: `Story ${index + 1}`,
		src,
		thumbnail: `https://placehold.co/300x533?text=Story+${index + 1}`,
	}))
);
</script>
