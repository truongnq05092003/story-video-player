<template>
	<template>
		<teleport to="body">
			<div
				v-if="isOpen"
				class="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
			>
				<div class="relative w-full max-w-lg h-full max-h-[calc(100vh-64px)] aspect-[9/16]">
					<VideoPlayer
						v-if="currentVideo"
						ref="videoRef"
						:video="currentVideo"
						:autoplay-on-hover="false"
						@progress="updateProgress"
					/>
					<!-- Progress Bar -->
					<div class="absolute top-5 left-2 right-2 flex gap-1 z-50">
						<div
							v-for="(v, i) in videos"
							:key="v.id"
							class="flex-1 h-1 bg-white bg-opacity-30 rounded"
						>
							<div
								class="h-full bg-white rounded transition-all duration-200"
								:style="{
									width: i < currentIndex ? '100%' : i === currentIndex ? progress + '%' : '0%',
								}"
							/>
						</div>
					</div>
					<!-- Close Button -->
					<button
						@click="close"
						class="absolute top-10 right-4 text-white z-50 text-lg"
					>
						✕
					</button>
				</div>
			</div>
		</teleport>
	</template>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import type { IVideo } from "../../types/common";
import VideoPlayer from "../video-player/index.vue";

const props = defineProps<{
	videos: IVideo[];
	isOpen: boolean;
	videoID?: number;
}>();

const emit = defineEmits(["close"]);

const progress = ref(0);
const currentIndex = ref(0);
const videoRef = ref<any>(null);

const currentVideo = computed(() => props.videos.find((v) => v.id === props.videoID));

watch(
	[() => props.videoID, () => props.isOpen],
	async ([newID, isOpen]) => {
		if (isOpen && newID != null) {
			const idx = props.videos.findIndex((v) => v.id === newID);
			currentIndex.value = idx !== -1 ? idx : 0;
			progress.value = 0;

			await nextTick();
			videoRef.value?.handlePlay?.();
		}
	},
	{ immediate: true }
);

function updateProgress(value: number) {
	progress.value = value;
}

function close() {
	progress.value = 0;
	emit("close");
	console.log("11111");
}
</script>
