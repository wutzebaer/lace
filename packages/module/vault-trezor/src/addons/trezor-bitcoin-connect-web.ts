import TrezorConnect from '@trezor/connect-web';

import { initTrezorConnectWeb } from './trezor-connect-init-web';

import type { TrezorBitcoinConnect } from '../trezor-bitcoin-connect';

/**
 * Resolves the web Trezor Connect instance for Bitcoin calls. Initialization
 * goes through TrezorKeyAgent.initializeTrezorTransport - the same single
 * init path the Cardano connector uses, tolerant of an already-initialized
 * instance - so Cardano and Bitcoin flows share one Connect context. The
 * '@trezor/connect-web' dependency is pinned to the version resolved by
 * '@cardano-sdk/hardware-trezor' so both import the same module singleton.
 */
export const getTrezorBitcoinConnectWeb =
  async (): Promise<TrezorBitcoinConnect> => {
    await initTrezorConnectWeb();
    return TrezorConnect;
  };
