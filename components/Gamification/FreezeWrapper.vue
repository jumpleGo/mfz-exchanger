<template>
  <div>
    <FreezeModal 
      :show="freeze.showModal.value" 
      :expires-at="freeze.expiresAt.value"
      @close="freeze.closeModal"
    />
    
    <FreezeBadge
      :is-active="freeze.isFreezed.value"
      :expires-at="freeze.expiresAt.value"
    />
  </div>
</template>

<script setup lang="ts">
import {useFreezePromotion} from "~/composables/gamification/useFreezePromotion";
import FreezeModal from "~/components/Gamification/FreezeModal.vue";
import FreezeBadge from "~/components/Gamification/FreezeBadge.vue";

const freeze = useFreezePromotion();

onMounted(() => {
  freeze.checkAndActivate();
});

onUnmounted(() => {
  freeze.cleanup();
});
</script>
