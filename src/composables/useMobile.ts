import { ref, onMounted, onUnmounted } from "vue";

export function useMobile() {
	const $isMobile = ref(false);
	function checkIsMobile() {
		$isMobile.value = window.innerWidth < 768;
	}
	onMounted(() => {
		checkIsMobile();
		window.addEventListener("resize", checkIsMobile);
	});
	onUnmounted(() => {
		window.removeEventListener("resize", checkIsMobile);
	});
	return { $isMobile };
}
