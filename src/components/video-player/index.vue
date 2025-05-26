<template>
	<div
		ref="divRef"
		class="relative w-full h-full aspect-[9/16] rounded-xl overflow-hidden"
		@click="onClickAction"
	>
		<img
			v-if="isImageMode"
			:src="video.src ?? ''"
			aspect-ratio="16/9"
			class="absolute inset-0 w-full h-full object-cover z-50 transition-opacity duration-300"
		/>
		<img
			v-else
			:src="video.thumbnail ?? ''"
			aspect-ratio="16/9"
			:class="[
				'absolute inset-0 w-full h-full object-cover z-50 transition-opacity duration-300',
				isPlaying ? 'opacity-0' : 'opacity-100',
			]"
		/>
		<video
			v-show="!isImageMode"
			ref="videoRef"
			class="w-full h-full object-cover absolute inset-0 z-50"
			autoplay
			playsinline
			:controls="false"
			data-object-fit="cover"
		></video>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineExpose, watch, nextTick } from "vue";
import type { IVideo } from "../../types/common";
import Hls from "hls.js";
import { VImg } from "vuetify/components";

const props = defineProps<{ video: IVideo; initOnMount?: boolean }>();
const emit = defineEmits<{
	(e: "progress", value: number): void;
	(e: "ended"): void;
	(e: "offsetR"): void;
	(e: "offsetL"): void;
}>();

const divRef = ref<HTMLElement | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);
const isPlaying = ref<boolean>(false);
const isImageMode = ref<boolean>(false);

let hls: Hls | null = null;
let rafId: number | null = null;
let imageTimeout: number | null = null;
let imageStartTime = 0;
let imageElapsed = 0;

const isImage = (url: string): boolean => {
	return /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
};

function onClickAction(e: MouseEvent) {
	const div = divRef.value;
	if (!div) return;
	const rect = div.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const mid = rect.width / 2;
	if (x < mid) {
		emit("offsetL");
	} else {
		emit("offsetR");
	}
	isPlaying.value = false;
	isImageMode.value = false;
	cancelAnimationFrame(rafId!);
	emit("progress", 0);
}

function animateProgress() {
	emit("progress", 0);
	if (isImageMode.value) {
		const elapsed = Date.now() - imageStartTime;
		const progress = Math.min((elapsed / 3000) * 100, 100);
		emit("progress", progress);
		if (progress < 100 && isPlaying.value) {
			rafId = requestAnimationFrame(animateProgress);
		}
		return;
	}
	if (!videoRef.value || !isPlaying.value) return;
	const { currentTime, duration } = videoRef.value;
	if (!isNaN(duration) && duration > 0) {
		emit("progress", (currentTime / duration) * 100);
	}
	rafId = requestAnimationFrame(animateProgress);
}

function handlePlayImage() {
	isPlaying.value = true;
	imageStartTime = Date.now() - imageElapsed;
	animateProgress();
	const remaining = 3000 - imageElapsed;
	imageTimeout = window.setTimeout(() => {
		if (!isImageMode.value) return;
		emit("ended");
		isPlaying.value = false;
		isImageMode.value = true;
		cancelAnimationFrame(rafId!);
	}, remaining);
}

function handlePauseImage() {
	isPlaying.value = false;
	if (imageStartTime) {
		imageElapsed = Date.now() - imageStartTime;
	}
	clearTimeout(imageTimeout!);
	cancelAnimationFrame(rafId!);
}

function handlePlay() {
	if (isImageMode.value) {
		handlePlayImage();
		return;
	}
	if (!videoRef.value) return;
	videoRef.value.play();
	isPlaying.value = true;
	animateProgress();
	videoRef.value.onended = () => {
		emit("ended");
		isPlaying.value = false;
		isImageMode.value = false;
		cancelAnimationFrame(rafId!);
	};
}

function handlePause() {
	if (isImageMode.value) {
		handlePauseImage();
		return;
	}
	if (!videoRef.value) return;
	videoRef.value.pause();
	cancelAnimationFrame(rafId!);
}

function handleVolume(value: number) {
	if (!videoRef.value) return;
	const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
	if (isMobile) {
		videoRef.value.muted = value === 0;
	} else {
		videoRef.value.volume = value;
	}
}

function toggleMute(muted: boolean) {
	if (!videoRef.value) return;
	videoRef.value.muted = muted;
}

async function setupHLS(src: string) {
	if (!videoRef.value) return;

	// reset state
	cancelAnimationFrame(rafId!);
	clearTimeout(imageTimeout!);
	isPlaying.value = false;
	isImageMode.value = false;
	imageElapsed = 0;

	if (hls) {
		hls.destroy();
		hls = null;
	}

	videoRef.value.src = "";
	videoRef.value.load();

	isImageMode.value = isImage(src);

	if (isImageMode.value) {
		handlePlayImage();
		return;
	}

	if (Hls.isSupported()) {
		hls = new Hls({ maxBufferLength: 60 });
		hls.attachMedia(videoRef.value);
		hls.on(Hls.Events.MEDIA_ATTACHED, () => {
			hls?.loadSource(src);
		});
		hls.on(Hls.Events.MANIFEST_PARSED, () => {
			handlePlay();
		});
		hls.on(Hls.Events.ERROR, (_, data) => {
			console.error("HLS.js error:", data);
		});
	} else {
		videoRef.value.src = src;
		await nextTick();
		videoRef.value.addEventListener("loadedmetadata", () => {
			handlePlay();
		});
	}
}

onMounted(() => {
	if (props.initOnMount && props.video.src) {
		setupHLS(props.video.src);
	}
});

watch([() => props.video.src, () => props.video.id], async ([newSrc]) => {
	if (newSrc) {
		await setupHLS(newSrc);
	}
});

onUnmounted(() => {
	cancelAnimationFrame(rafId!);
	clearTimeout(imageTimeout!);
	hls?.destroy();
	hls = null;
});

defineExpose({ handlePlay, handlePause, handleVolume, toggleMute });
</script>

<style scoped></style>
