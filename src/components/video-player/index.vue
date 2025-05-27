<template>
	<div
		ref="divRef"
		class="relative w-full h-full aspect-[9/16] rounded-xl overflow-hidden"
		@click="onClickAction"
	>
		<img
			:src="isImageMode ? video.src ?? '' : video.thumbnail ?? ''"
			aspect-ratio="16/9"
			:class="[
				'absolute inset-0 w-full h-full object-cover z-50 transition-opacity duration-300',
				!isImageMode ? (isPlaying ? 'opacity-0' : 'opacity-100') : '',
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

const props = defineProps<{ video: IVideo; initOnMount?: boolean }>();
const emit = defineEmits<{
	(e: "progress", value: number): void;
	(e: "ended"): void;
	(e: "offsetR"): void; // mouse action right
	(e: "offsetL"): void; // mouse action left
	(e: "offsetB"): void; // mouse action bottom
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
const TIMER_IMG = 3000;

const swipeStart = ref<{ x: number; y: number; time: number } | null>(null);
const minDistance = 50;
const maxTime = 500;

function handleTouchStart(e: TouchEvent | MouseEvent) {
	const touch = "touches" in e ? e.touches[0] : (e as MouseEvent);
	swipeStart.value = {
		x: touch.pageX,
		y: touch.pageY,
		time: Date.now(),
	};
}

function handleTouchEnd(e: TouchEvent | MouseEvent) {
	if (!swipeStart.value) return;

	const touch = "changedTouches" in e ? e.changedTouches[0] : (e as MouseEvent);
	const dx = touch.pageX - swipeStart.value.x;
	const dy = touch.pageY - swipeStart.value.y;
	const dt = Date.now() - swipeStart.value.time;

	if (dt > maxTime) {
		swipeStart.value = null;
		return;
	}

	if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minDistance) {
		if (dx > 0) emit("offsetL");
		else emit("offsetR");
		emit("progress", 0);
		isPlaying.value = false;
		isImageMode.value = false;
		cancelAnimationFrame(rafId!);
	} else if (Math.abs(dy) > minDistance && dy < 0) {
		emit("offsetB");
	}

	swipeStart.value = null;
}

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
	emit("progress", 0);
	isPlaying.value = false;
	isImageMode.value = false;
	cancelAnimationFrame(rafId!);
}

function animateProgress() {
	emit("progress", 0);
	if (isImageMode.value) {
		const elapsed = Date.now() - imageStartTime;
		const progress = Math.min((elapsed / TIMER_IMG) * 100, 100);
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

	clearTimeout(imageTimeout!);
	cancelAnimationFrame(rafId!);

	imageStartTime = Date.now() - imageElapsed;
	animateProgress();

	const remaining = TIMER_IMG - imageElapsed;
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
		emit("progress", 0);
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

	videoRef.value.pause();
	videoRef.value.removeAttribute("src");
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
			let errorType = data.type;
			let errorDetails = data.details;
			let errorFatal = data.fatal;

			console.log(`[HLS Error] Type: ${errorType}, Details: ${errorDetails}, Fatal: ${errorFatal}`);
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
	const div = divRef.value;
	if (!div || !props.initOnMount || !props.video.src) return;

	div.addEventListener("touchstart", handleTouchStart);
	div.addEventListener("mousedown", handleTouchStart);
	div.addEventListener("touchend", handleTouchEnd);
	document.addEventListener("mouseup", handleTouchEnd);

	setupHLS(props.video.src);
});

watch([() => props.video.src, () => props.video.id], async ([newSrc]) => {
	if (newSrc) {
		await setupHLS(newSrc);
	}
});

onUnmounted(() => {
	// remove event listeners
	const div = divRef.value;
	if (!div) return;

	div.removeEventListener("touchstart", handleTouchStart);
	div.removeEventListener("mousedown", handleTouchStart);
	div.removeEventListener("touchend", handleTouchEnd);
	document.removeEventListener("mouseup", handleTouchEnd);

	// clean up HLS and video state
	cancelAnimationFrame(rafId!);
	clearTimeout(imageTimeout!);
	hls?.destroy();
	hls = null;
});

defineExpose({ handlePlay, handlePause, handleVolume, toggleMute, setupHLS });
</script>

<style scoped></style>
