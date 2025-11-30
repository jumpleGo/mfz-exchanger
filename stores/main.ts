import { ref } from "vue";
import { defineStore } from "pinia";
export const useMainStore = defineStore("main", () => {
  const showModal = ref<boolean>(false);

  return { showModal };
});
