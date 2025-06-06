<template>
	<TransitionRoot
		as="template"
		:show="isOpen"
	>
		<Dialog
			as="div"
			class="fixed inset-0 z-50"
			@close="close"
		>
			<TransitionChild
				as="template"
				enter="ease-out duration-300"
				enter-from="opacity-0"
				enter-to="opacity-100"
				leave="ease-in duration-200"
				leave-from="opacity-100"
				leave-to="opacity-0"
			>
				<div class="fixed inset-0 bg-black bg-opacity-90" />
			</TransitionChild>

			<div class="fixed inset-0 flex items-center justify-center">
				<TransitionChild
					as="template"
					enter="transform transition duration-300 ease-out"
					enter-from="-translate-y-[100px] opacity-0"
					enter-to="translate-y-0 opacity-100"
					leave="transform transition duration-300 ease-in"
					leave-from="translate-y-0 opacity-100"
					leave-to="translate-y-[100px] opacity-0"
				>
					<DialogPanel
						:class="[
							'relative w-[calc(100vw-32px)] md:w-full max-w-lg aspect-[9/16]',
							isSafariOniOS ? 'h-[calc(100vh-100px)]' : 'h-[calc(100vh-32px)]',
						]"
					>
						<VideoPlayer
							v-if="currentVideo"
							ref="videoRef"
							:video="currentVideo"
							:init-on-mount="true"
							@ended="handleEnded"
							@progress="updateProgress"
							@offset-l="prevVideo"
							@offset-r="nextVideo"
							@offset-b="mouseEventUp"
						/>
						<!-- Progress Bars -->
						<div class="absolute top-4 left-4 right-4 z-50 flex gap-1">
							<div
								v-for="(_, idx) in videos"
								:key="idx"
								class="flex-1 h-[3px] bg-white bg-opacity-30 rounded overflow-hidden"
							>
								<div
									class="w-0 h-full bg-white rounded transition-all duration-300 ease-linear"
									:style="{ width: idx < currentIndex ? '100%' : idx === currentIndex ? progress + '%' : '0%' }"
								></div>
							</div>
						</div>
						<!-- Control -->
						<div
							id="stories-control"
							class="absolute top-8 right-4 z-50 flex gap-2"
						>
							<button
								@click="togglePlaying"
								class="cursor-pointer focus:outline-none"
							>
								<component
									:is="LucideIcon[isPlaying ? 'Pause' : 'Play']"
									class="w-6 h-6 fill-white stroke-transparent"
								/>
							</button>
							<button
								@click="toggleVolumn"
								class="cursor-pointer focus:outline-none"
							>
								<component
									:is="LucideIcon[isVolumn ? 'Volume2' : 'VolumeX']"
									class="w-6 h-6 text-white"
								/>
							</button>
							<button
								v-if="!$isMobile"
								class="cursor-pointer focus:outline-none"
							>
								<Ellipsis class="w-6 h-6 text-white" />
							</button>
							<button
								v-else
								class="cursor-pointer focus:outline-none"
								@click="close"
							>
								<X class="w-6 h-6 text-white" />
							</button>
						</div>

						<!-- Control action -->
						<button
							v-if="hasActionPrev"
							data-action="prev"
							class="absolute top-1/2 -left-20 z-50 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white rounded-full bg-white bg-opacity-10"
						>
							<ChevronLeft
								@click="prevVideo"
								stroke-width="1.5"
								class="w-6 h-6 text-white cursor-pointer"
							/>
						</button>
						<button
							v-if="hasActionNext"
							data-action="next"
							class="absolute top-1/2 -right-20 z-50 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white rounded-full bg-white bg-opacity-10"
						>
							<ChevronRight
								@click="nextVideo"
								stroke-width="1.5"
								class="w-6 h-6 text-white cursor-pointer"
							/>
						</button>
					</DialogPanel>
				</TransitionChild>
				<button
					v-if="!$isMobile"
					@click="close"
					class="absolute top-5 right-5 z-50 cursor-pointer"
				>
					<X class="text-white" />
				</button>
			</div>
		</Dialog>
	</TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { ref, computed, watch, nextTick } from "vue";
import VideoPlayer from "../video-player/index.vue";
import type { IVideo } from "../../types/common";
import { X, Ellipsis, ChevronLeft, ChevronRight } from "lucide-vue-next";
import * as LucideIcon from "lucide-vue-next";
import { useMobile } from "../../composables/useMobile";
import { useRouter } from "vue-router";

const props = defineProps<{ videos: IVideo[]; isOpen: boolean; videoID?: number }>();
const emit = defineEmits(["close"]);

const router = useRouter();

const progress = ref<number>(0);
const currentIndex = ref<number>(0);
const isVolumn = ref<Boolean>(true);
const isPlaying = ref<Boolean>(true);

const videoRef = ref<InstanceType<typeof VideoPlayer> | null>(null);
const currentVideo = computed(() => props.videos[currentIndex.value]);

const { $isMobile } = useMobile();
const isSafariOniOS =
	/iPhone|iPad|iPod/i.test(navigator.userAgent) &&
	/Safari/i.test(navigator.userAgent) &&
	!/CriOS|FxiOS|EdgiOS|OPiOS/i.test(navigator.userAgent);

const hasActionPrev = computed(() => !$isMobile.value && currentIndex.value > 0);
const hasActionNext = computed(() => !$isMobile.value && currentIndex.value < props.videos.length - 1);

watch(
	[() => props.videoID, () => props.isOpen],
	async ([id, open]) => {
		if (open && id != null) {
			currentIndex.value = id;
			progress.value = 0;
			await nextTick();
			videoRef.value?.handlePlay();
		}
	},
	{ immediate: true }
);

function updateProgress(value: number) {
	progress.value = value;
}

async function handleEnded() {
	if (currentIndex.value === props.videos.length - 1) return;
	currentIndex.value++;
	await nextTick();
	videoRef.value?.handlePlay();
}

function togglePlaying() {
	isPlaying.value = !isPlaying.value;
	isPlaying.value ? videoRef.value?.handlePlay() : videoRef.value?.handlePause();
}

function toggleVolumn() {
	isVolumn.value = !isVolumn.value;
	videoRef.value?.toggleMute(!isVolumn.value);
}

function close() {
	emit("close");
	progress.value = 0;
	isVolumn.value = true;
	isPlaying.value = true;
}

async function playCurrentVideo() {
	if (!videoRef.value || !currentVideo.value?.src) return;
	progress.value = 0;
	isVolumn.value = true;
	isPlaying.value = true;
	await nextTick();
	await videoRef.value.setupHLS(currentVideo.value.src);
}

async function nextVideo() {
	if (currentIndex.value >= props.videos.length - 1) {
		await playCurrentVideo();
		return;
	}
	currentIndex.value++;
	await playCurrentVideo();
}

async function prevVideo() {
	if (currentIndex.value <= 0) {
		await playCurrentVideo();
		return;
	}
	currentIndex.value--;
	await playCurrentVideo();
}

async function mouseEventUp() {
	if (!currentVideo.value) return;
	emit("close");
	router.push(`/view/${currentVideo.value.id}`);
}
</script>
