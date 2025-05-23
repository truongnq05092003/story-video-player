<template>
	<div class="my-10">
		<div class="w-full max-w-[900px] mx-auto">
			<h1 class="mb-4 text-lg font-semibold italic">Story Demo</h1>
			<WrapperStory>
				<VideoPlayer
					v-for="(x, idx) in videos"
					:key="idx"
					:video="x"
					autoplay-on-hover
					@click="openModal(x.id)"
				/>
			</WrapperStory>
		</div>
	</div>

	<StoryModal
		:videos="videos"
		:isOpen="showModal"
		:videoID="videoID"
		@close="() => (showModal = false)"
	/>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { IVideo } from "./types/common";
import WrapperStory from "./components/wrapper-story/index.vue";
import VideoPlayer from "./components/video-player/index.vue";
import StoryModal from "./components/dialog-story/index.vue";

const videos = ref<IVideo[]>(
	[
		"https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		"https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		"https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		"https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
		"https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
	].map((src, index) => ({
		id: index + 1,
		title: `Story ${index + 1}`,
		src,
		thumbnail: `https://placehold.co/300x533?text=Story+${index + 1}`,
	}))
);

const showModal = ref(false);
const videoID = ref(1);

function openModal(index: number) {
	videoID.value = index;
	showModal.value = true;
}
</script>
