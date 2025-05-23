<template>
	<div
		class="relative w-full h-full aspect-[9/16] bg-transparent cursor-pointer"
		@mouseenter="hoverEnabled ? handlePlay : null"
		@mouseleave="hoverEnabled ? handlePause : null"
	>
		<img
			:src="video.thumbnail ?? ''"
			:class="[
				'absolute inset-0 w-full h-full object-cover z-50 transition-opacity duration-300',
				isPlaying ? 'opacity-0' : 'opacity-100',
			]"
		/>
		<video
			ref="hlsRef"
			class="w-full h-full object-cover absolute inset-0"
			playsinline
			webkit-playsinline
			muted
			:controls="false"
		></video>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineExpose, computed } from "vue";
import type { IVideo } from "../../types/common";
import Hls from "hls.js";

interface IProps {
	video: IVideo;
	autoplayOnHover?: boolean;
}
const props = defineProps<IProps>();
const emit = defineEmits<{
	(e: "progress", value: number): void;
	(e: "ended"): void;
}>();

const hlsRef = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
let hls: Hls | null = null;
let interval: number | null = null;

onMounted(() => {
	if (!props.video.src) return;

	if (Hls.isSupported()) {
		hls = new Hls();
		hls.attachMedia(hlsRef.value!);
		hls.on(Hls.Events.MEDIA_ATTACHED, () => {
			hls?.loadSource(props.video.src!);
		});
		hls.on(Hls.Events.ERROR, (_, data) => {
			console.error("HLS.js error:", data);
		});
	} else if (hlsRef.value?.canPlayType("application/vnd.apple.mpegurl")) {
		hlsRef.value.src = props.video.src;
	}
});

function handlePlay() {
	if (!hlsRef.value) return;
	hlsRef.value.play();
	isPlaying.value = true;

	if (!interval) {
		interval = window.setInterval(updateProgress, 200);
	}

	hlsRef.value.onended = () => {
		emit("ended");
		isPlaying.value = false;
		clearProgress();
	};
}

function handlePause() {
	if (!hlsRef.value) return;
	hlsRef.value.pause();
	isPlaying.value = false;
	clearProgress();
}

function updateProgress() {
	if (!hlsRef.value || !isPlaying.value) return;
	const { duration, currentTime } = hlsRef.value;
	if (!isNaN(duration) && duration > 0) {
		emit("progress", (currentTime / duration) * 100);
	}
}

function clearProgress() {
	if (interval) {
		clearInterval(interval);
		interval = null;
	}
}

onUnmounted(() => {
	clearProgress();
	hls?.destroy();
});

defineExpose({ handlePlay });

const hoverEnabled = computed(() => props.autoplayOnHover !== false);
</script>
