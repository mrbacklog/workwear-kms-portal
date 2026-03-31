import { useState, useEffect } from 'react';

const PWA_DISMISSED_KEY = 'kms_pwa_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(
    () => !!localStorage.getItem(PWA_DISMISSED_KEY),
  );

  const isIos =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const isInStandaloneMode =
    'standalone' in window.navigator
      ? (window.navigator as Navigator & { standalone?: boolean }).standalone === true
      : window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const canInstall = !isInStandaloneMode && !isDismissed && (deferredPrompt !== null || isIos);

  async function promptInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  }

  function dismiss() {
    localStorage.setItem(PWA_DISMISSED_KEY, '1');
    setIsDismissed(true);
  }

  return { canInstall, promptInstall, isIos, isDismissed, dismiss };
}
