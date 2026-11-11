import { useEffect } from 'react';
import * as Linking from 'expo-linking';

import { handleAuthUrl } from '@/lib/auth-links';

/**
 * Single global deep-link listener for the OAuth callback.
 * Mount it exactly once (root layout) to avoid duplicate exchanges.
 */
export function useAuthDeepLinks() {
  useEffect(() => {
    let active = true;

    const processUrl = (url: string | null) => {
      if (!url || !active) return;
      void handleAuthUrl(url).catch(() => {
        // The callback screen renders a friendly error if the exchange fails.
      });
    };

    void Linking.getInitialURL().then(processUrl);

    const subscription = Linking.addEventListener('url', ({ url }) => processUrl(url));

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
}
