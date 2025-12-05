import {useFreezeAnalytics} from "~/composables/gamification/useFreezeAnalytics";

interface FreezeState {
  isActive: boolean;
  activatedAt: number | null;
  expiresAt: number | null;
  hasBeenShownModal: boolean;
}

const FREEZE_STORAGE_KEY = 'mfz_freeze_state';
const FREEZE_HISTORY_KEY = 'mfz_freeze_history';
const COOLDOWN_DURATION = 60 * 60 * 1000;

let freezeInstance: ReturnType<typeof createFreezePromotion> | null = null;

const createFreezePromotion = () => {
  const config = useRuntimeConfig();
  const isEnabled = config.public.gamificationFreezeEnabled;
  const analytics = useFreezeAnalytics();
  
  const state = reactive<FreezeState>({
    isActive: false,
    activatedAt: null,
    expiresAt: null,
    hasBeenShownModal: false,
  });

  const showModal = ref(false);
  let countdownInterval: NodeJS.Timeout | null = null;

  const saveToStorage = () => {
    if (process.client) {
      localStorage.setItem(FREEZE_STORAGE_KEY, JSON.stringify({
        isActive: state.isActive,
        activatedAt: state.activatedAt,
        expiresAt: state.expiresAt,
        hasBeenShownModal: state.hasBeenShownModal,
      }));
    }
  };

  const loadFromStorage = () => {
    if (process.client) {
      const stored = localStorage.getItem(FREEZE_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const now = Date.now();
          
          if (parsed.isActive && parsed.expiresAt && parsed.expiresAt > now) {
            state.isActive = true;
            state.activatedAt = parsed.activatedAt;
            state.expiresAt = parsed.expiresAt;
            state.hasBeenShownModal = parsed.hasBeenShownModal;
            startCountdown();
            return true;
          } else {
            clearStorage();
          }
        } catch (e) {
          console.error('Failed to parse freeze state', e);
        }
      }
    }
    return false;
  };

  const clearStorage = () => {
    if (process.client) {
      localStorage.removeItem(FREEZE_STORAGE_KEY);
    }
  };

  const checkCooldown = (): boolean => {
    if (!process.client) return false;
    
    const history = localStorage.getItem(FREEZE_HISTORY_KEY);
    if (!history) return true;
    
    try {
      const lastActivation = parseInt(history);
      const now = Date.now();
      return (now - lastActivation) >= COOLDOWN_DURATION;
    } catch (e) {
      return true;
    }
  };

  const saveActivationHistory = () => {
    if (process.client) {
      localStorage.setItem(FREEZE_HISTORY_KEY, Date.now().toString());
    }
  };

  const startCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    countdownInterval = setInterval(() => {
      if (!state.expiresAt) return;
      
      const remaining = state.expiresAt - Date.now();
      if (remaining <= 0) {
        deactivateFreeze();
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
      }
    }, 1000);
  };

  const activateFreeze = () => {
    const now = Date.now();
    const duration = config.public.gamificationFreezeDuration;
    
    state.isActive = true;
    state.activatedAt = now;
    state.expiresAt = now + duration;
    state.hasBeenShownModal = false;
    
    saveToStorage();
    saveActivationHistory();
    startCountdown();
    
    showModal.value = true;
    analytics.trackActivation();
    analytics.trackModalShown();
  };

  const deactivateFreeze = () => {
    state.isActive = false;
    state.activatedAt = null;
    state.expiresAt = null;
    state.hasBeenShownModal = false;
    
    clearStorage();
    analytics.trackExpired();
    
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  };

  const checkAndActivate = (): boolean => {
    if (!isEnabled) return false;
    if (!process.client) return false;
    
    if (loadFromStorage()) {
      return true;
    }
    
    if (!checkCooldown()) {
      return false;
    }
    
    const chance = Math.random();
    if (chance <= config.public.gamificationFreezeChance) {
      activateFreeze();
      return true;
    }
    
    return false;
  };

  const closeModal = () => {
    showModal.value = false;
    state.hasBeenShownModal = true;
    saveToStorage();
    analytics.trackModalClosed();
  };

  const cleanup = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  };

  return {
    state,
    showModal,
    isFreezed: computed(() => state.isActive),
    commission: computed(() => config.public.gamificationFreezeCommission),
    expiresAt: computed(() => state.expiresAt),
    checkAndActivate,
    closeModal,
    deactivateFreeze,
    cleanup,
  };
};

export const useFreezePromotion = () => {
  if (!freezeInstance) {
    freezeInstance = createFreezePromotion();
  }
  return freezeInstance;
};
