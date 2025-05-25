<template>
	<WrapperStory>
		<VideoPlayer
			v-for="(x, idx) in videos"
			:key="idx"
			:video="x"
			:init-on-mount="false"
			@click="openModal(idx)"
		/>
	</WrapperStory>
	<StoryModal
		:videos="videos"
		:isOpen="showModal"
		:videoID="videoID"
		@close="() => (showModal = false)"
	/>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { IVideo } from "../../types/common";
import WrapperStory from "../wrapper-story/index.vue";
import VideoPlayer from "../video-player/index.vue";
import StoryModal from "../dialog-story/index.vue";

defineProps<{
	videos: IVideo[];
}>();

const videoID = ref(0);
const showModal = ref(false);

function openModal(index: number) {
	videoID.value = index;
	showModal.value = true;
}
</script>
