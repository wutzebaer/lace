import { TrezorKeyAgent } from '@cardano-sdk/hardware-trezor';
import { CommunicationType } from '@cardano-sdk/key-management';
import TrezorConnect from '@trezor/connect-web';

import { TREZOR_MANIFEST } from '../const';

import type { TrezorConfig } from '@cardano-sdk/key-management';

/**
 * Firefox has no WebUSB, and its extension origin is a per-install
 * `moz-extension://` UUID. The device is reached through the connect.trezor.io
 * popup, which talks to Trezor Bridge / Trezor Suite on localhost - the same
 * route Trezor Connect uses for plain websites in Firefox.
 */
const isFirefoxExtension = (): boolean =>
  typeof location !== 'undefined' && location.protocol === 'moz-extension:';

const debugLog = (...args: unknown[]) => {
  // eslint-disable-next-line no-console
  if (isFirefoxExtension()) console.warn('[trezor-firefox]', ...args);
};

/**
 * Trezor Connect keeps the settings of the LAST `init` call, even when that
 * call ends in Init_AlreadyInitialized, and `@cardano-sdk/hardware-trezor`
 * calls `init` on its own (key-agent construction included) without a
 * `coreMode`. So the mode is pinned on the shared Connect instance itself
 * rather than by initializing first.
 */
const pinPopupCoreMode = (() => {
  let isPinned = false;
  return () => {
    if (isPinned || !isFirefoxExtension()) return;
    isPinned = true;
    const originalInit = TrezorConnect.init.bind(TrezorConnect);
    TrezorConnect.init = (async settings =>
      originalInit({
        ...settings,
        coreMode: 'popup',
      })) as typeof TrezorConnect.init;
    debugLog('Trezor Connect pinned to popup mode');
  };
})();

/** Single web init path for Trezor Connect. */
export const initTrezorConnectWeb = async (
  trezorConfig: TrezorConfig = {
    communicationType: CommunicationType.Web,
    manifest: TREZOR_MANIFEST,
    lazyLoad: true,
  },
): Promise<void> => {
  pinPopupCoreMode();
  await TrezorKeyAgent.initializeTrezorTransport(trezorConfig);
};

export { debugLog as trezorFirefoxDebugLog };
