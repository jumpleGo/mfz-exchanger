export const useFreezeAnalytics = () => {
  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', eventName, {
        event_category: 'gamification',
        event_label: 'freeze_promotion',
        ...params,
      });
    }
    
    if (typeof (window as any).ym === 'function') {
      (window as any).ym(process.env.NUXT_YM_ID, 'reachGoal', eventName, params);
    }
    
    console.log('[Freeze Analytics]', eventName, params);
  };

  return {
    trackActivation: () => trackEvent('freeze_activated'),
    trackModalShown: () => trackEvent('freeze_modal_shown'),
    trackModalClosed: () => trackEvent('freeze_modal_closed'),
    trackExchangeWithFreeze: (pair: string, amount: number) =>
      trackEvent('freeze_exchange_completed', { pair, amount }),
    trackExpired: () => trackEvent('freeze_expired'),
  };
};
