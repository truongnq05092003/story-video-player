// utils/hlsPool.ts
import Hls from "hls.js";

const pool: Map<string, Hls> = new Map();

export function getOrCreateHls(videoEl: HTMLVideoElement, src: string): Hls {
	let hls = pool.get(src);
	if (!hls) {
		hls = new Hls({ maxBufferLength: 60 });
		hls.loadSource(src);
		hls.attachMedia(videoEl);
		pool.set(src, hls);
	} else {
		hls.attachMedia(videoEl);
	}
	return hls;
}

export function preloadHls(src: string): void {
	if (!pool.has(src)) {
		const hls = new Hls({ maxBufferLength: 60 });
		hls.loadSource(src);
		pool.set(src, hls);
	}
}

export function destroyHls(src: string) {
	const hls = pool.get(src);
	if (hls) {
		hls.destroy();
		pool.delete(src);
	}
}
