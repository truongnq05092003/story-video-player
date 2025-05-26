<template>
	<div class="relative w-full h-full aspect-[9/16] rounded-xl overflow-hidden">
		<img
			:src="video.thumbnail ?? ''"
			:class="[
				'absolute inset-0 w-full h-full object-cover z-50 transition-opacity duration-300',
				isPlaying ? 'opacity-0' : 'opacity-100',
			]"
		/>
		<video
			ref="videoRef"
			class="w-full h-full object-cover absolute inset-0 z-50"
			autoplay
			playsinline
			:controls="false"
			@click="onVideoClick"
		></video>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineExpose, watch, nextTick } from "vue";
import type { IVideo } from "../../types/common";
import Hls from "hls.js";

const props = defineProps<{ video: IVideo; initOnMount?: boolean }>();
const emit = defineEmits<{
	(e: "progress", value: number): void;
	(e: "ended"): void;
	(e: "offsetR"): void;
	(e: "offsetL"): void;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
let hls: Hls | null = null;
let rafId: number | null = null;

let lastTap = 0;
const tapThreshold = 400; // ms

function onVideoClick(e: MouseEvent) {
	const now = Date.now();
	if (now - lastTap < tapThreshold) return;
	lastTap = now;

	const videoEl = videoRef.value;
	if (!videoEl) return;

	const rect = videoEl.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const mid = rect.width / 2;

	if (x < mid) {
		emit("offsetL");
	} else {
		emit("offsetR");
	}
}

function animateProgress() {
	if (!videoRef.value || !isPlaying.value) return;
	const { currentTime, duration } = videoRef.value;
	if (!isNaN(duration) && duration > 0) {
		emit("progress", (currentTime / duration) * 100);
	}
	rafId = requestAnimationFrame(animateProgress);
}

function handlePlay() {
	if (!videoRef.value) return;

	videoRef.value.play();
	isPlaying.value = true;
	animateProgress();

	videoRef.value.onended = () => {
		emit("ended");
		isPlaying.value = false;
		cancelAnimationFrame(rafId!);
	};
}

function handlePause() {
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

function onVisibilityChange() {
	if (!videoRef.value) return;

	if (document.visibilityState === "hidden") {
		handlePause();
	} else if (document.visibilityState === "visible") {
		handlePlay();
	}
}

onMounted(() => {
	if (!videoRef.value || !props.video.src || !props.initOnMount) return;

	if (Hls.isSupported()) {
		hls = new Hls({ maxBufferLength: 60 });
		hls.attachMedia(videoRef.value);
		hls.on(Hls.Events.MEDIA_ATTACHED, () => {
			hls?.loadSource(props.video.src!);
		});
		hls.on(Hls.Events.ERROR, (_, data) => {
			console.error("HLS.js error:", data);
		});
	} else if (videoRef.value.canPlayType("application/vnd.apple.mpegurl")) {
		videoRef.value.src = props.video.src;
		videoRef.value.addEventListener("loadedmetadata", () => {
			handlePlay();
		});
	}
	document.addEventListener("visibilitychange", onVisibilityChange);
});

watch([() => props.video.src, () => props.video.id], async ([_src]) => {
	if (!videoRef.value || !_src) return;

	isPlaying.value = false;
	cancelAnimationFrame(rafId!);

	if (Hls.isSupported()) {
		if (hls && hls.media !== videoRef.value) {
			hls.attachMedia(videoRef.value);
		}
		hls?.loadSource(_src);
		hls?.once(Hls.Events.MANIFEST_PARSED, () => {
			handlePlay();
		});
	} else {
		videoRef.value.src = _src;
		await nextTick();
		handlePlay();
	}
});

onUnmounted(() => {
	cancelAnimationFrame(rafId!);
	hls?.destroy();
	hls = null;
	document.removeEventListener("visibilitychange", onVisibilityChange);
});

defineExpose({ handlePlay, handlePause, handleVolume, toggleMute });
</script>

<style scoped></style>
