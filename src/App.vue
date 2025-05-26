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

const MOCK_API = [
	{
		id: 1,
		title: "Story 1",
		src: "https://alicestyle-ccc-prod.s3.ap-northeast-1.amazonaws.com/PD651692520344271_aef3ca7f-b37c-468c-9a82-e1e32cb55047_large.jpg",
		thumbnail:
			"https://alicestyle-ccc-prod.s3.ap-northeast-1.amazonaws.com/PD651692520344271_aef3ca7f-b37c-468c-9a82-e1e32cb55047_large.jpg",
	},
	{
		id: 2,
		title: "Story 2",
		src: "https://alicestyle-ccc-prod.s3.ap-northeast-1.amazonaws.com/PD761304358498839_7122a2b3-7806-4696-92f4-9da65528d915_large.jpg",
		thumbnail:
			"https://alicestyle-ccc-prod.s3.ap-northeast-1.amazonaws.com/PD761304358498839_7122a2b3-7806-4696-92f4-9da65528d915_large.jpg",
	},
	{
		id: 3,
		title: "Story 3",
		src: "https://ddjk7crxx6y3u.cloudfront.net/32c6b2ed-0043-4370-9f42-109da365ae66-test-short-video.m3u8",
		thumbnail:
			"https://alicestyle-ccc-prod.s3.ap-northeast-1.amazonaws.com/PD321360063119173_7565d32d-fb35-4d38-aeac-db65f36eae71_large.jpg",
	},
	{
		id: 4,
		title: "Story 4",
		src: "https://alicestyle-ccc-prod.s3.ap-northeast-1.amazonaws.com/PD249137024392900_17fa034e-ecbb-4889-8bad-1f8ac94afdbf_large.jpg",
		thumbnail:
			"https://alicestyle-ccc-prod.s3.ap-northeast-1.amazonaws.com/PD249137024392900_17fa034e-ecbb-4889-8bad-1f8ac94afdbf_large.jpg",
	},
	{
		id: 5,
		title: "Story 5",
		src: "https://alicestyle-ccc-prod.s3.ap-northeast-1.amazonaws.com/PD094648331462383_ee3d2e33-cf49-4f2b-9e2b-3bc57b4d3440_large.jpg",
		thumbnail:
			"https://alicestyle-ccc-prod.s3.ap-northeast-1.amazonaws.com/PD094648331462383_ee3d2e33-cf49-4f2b-9e2b-3bc57b4d3440_large.jpg",
	},
];

const videos = ref<IVideo[]>(MOCK_API);
</script>
