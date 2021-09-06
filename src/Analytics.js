// @flow strict

if (!window.gtag) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args) {
    window.dataLayer.push(arguments);
  };
}

const Analytics = {
  logEvent: (
    category: string,
    action: string,
    label?: ?string,
    value?: ?number,
    interaction?: boolean = true,
  ): void => {
    window.gtag('event', action, {
      non_interaction: !interaction,
      even