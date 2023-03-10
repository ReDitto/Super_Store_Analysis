
// @flow strict

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AbstractComponent } from 'react';
import Analytics from './Analytics';

type ServiceWorkerContextValue = {|
  updateAvailable: boolean,
  cacheComplete: boolean,
  applyUpdate: () => void,
|};

const ServiceWorkerContext = createContext<ServiceWorkerContextValue>({
  updateAvailable: false,
  cacheComplete: false,
  applyUpdate: () => {},
});

export function withServiceWorkerContextProvider<Config: {}>(
  Component: AbstractComponent<Config>,
): AbstractComponent<Config> {
  return (props: Config) => {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [cacheComplete, setCacheComplete] = useState(false);
    const [
      registration,
      setRegistration,
    ] = useState<?ServiceWorkerRegistration>(null);

    const value = useMemo(() => {
      return {
        updateAvailable,
        cacheComplete,
        applyUpdate: () => {
          Analytics.logEvent(
            'service_worker_apply_update',
            'start',
            undefined,
            undefined,
            false,
          );

          if (!registration || !registration.waiting) {
            Analytics.logEvent(
              'service_worker_apply_update',
              'failure',
              undefined,
              undefined,
              false,
            );

            return;
          }
          const waitingServiceWorker = registration.waiting;
          waitingServiceWorker.addEventListener('statechange', () => {
            if (waitingServiceWorker.state === 'activated') {
              Analytics.logEvent(
                'service_worker_apply_update',
                'success',
                undefined,
                undefined,
                false,
              );

              window.location.reload();
            }
          });

          waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
        },
      };
    }, [updateAvailable, cacheComplete, registration]);

    useEffect(() => {
      if (window.updateAvailable) {
        window.updateAvailable.then((registration) => {
          console.log('service_worker', 'update_available');
          Analytics.logEvent(
            'service_worker',
            'update_available',
            undefined,
            undefined,
            false,
          );

          setUpdateAvailable(true);
        });
      }

      if (window.cacheComplete) {
        window.cacheComplete.then((registration) => {
          console.log('service_worker', 'cache_complete');
          Analytics.logEvent(
            'service_worker',
            'cache_complete',
            undefined,
            undefined,
            false,
          );

          setCacheComplete(true);
        });
      }

      (async () => {
        if (navigator.serviceWorker) {
          const serviceWorker = navigator.serviceWorker;
          const registration = await serviceWorker.getRegistration('/');
          if (!registration) {
            return;
          }

          setRegistration(registration);

          if (registration.waiting) {
            console.log('service_worker', 'update_available');
            Analytics.logEvent(
              'service_worker',
              'update_available',
              undefined,
              undefined,
              false,
            );

            setUpdateAvailable(true);
          }
        }
      })();
    }, []);

    return (
      <ServiceWorkerContext.Provider value={value}>
        <Component {...props} />
      </ServiceWorkerContext.Provider>
    );
  };
}

export function useServiceWorkerContext(): ServiceWorkerContextValue {
  const context = useContext(ServiceWorkerContext);
  return context;
}