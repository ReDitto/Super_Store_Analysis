
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