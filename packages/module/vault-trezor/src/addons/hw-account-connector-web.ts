import { TrezorKeyAgent } from '@cardano-sdk/hardware-trezor';
import { CommunicationType, KeyPurpose } from '@cardano-sdk/key-management';

import { makeBitcoinHwAccountConnector } from '../bitcoin/hw-account-connector';
import { cardanoAccountsFromXpub } from '../cardano-accounts-from-xpub';
import { getTrezorBitcoinConnectWeb } from './trezor-bitcoin-connect-web';
import {
  initTrezorConnectWeb,
  trezorFirefoxDebugLog,
} from './trezor-connect-init-web';

import type { AvailableAddons } from '..';
import type { ContextualLaceInit } from '@lace-contract/module';
import type {
  DerivationType,
  HwAccountConnector,
} from '@lace-contract/onboarding-v2';

const getCardanoXpub = async (
  accountIndex: number,
  derivationType?: DerivationType,
) => {
  await initTrezorConnectWeb();
  trezorFirefoxDebugLog('requesting Cardano account key', {
    accountIndex,
    derivationType,
  });
  try {
    const xpub = await TrezorKeyAgent.getXpub({
      accountIndex,
      communicationType: CommunicationType.Web,
      purpose: KeyPurpose.STANDARD,
      derivationType,
    });
    trezorFirefoxDebugLog('received Cardano account key');
    return xpub;
  } catch (error) {
    trezorFirefoxDebugLog('Cardano account key request failed', error);
    throw error;
  }
};

const loadHwAccountConnector: ContextualLaceInit<
  HwAccountConnector[],
  AvailableAddons
> = () => [
  {
    blockchainName: 'Cardano',
    connectHardwareAccounts: async (state, props) => {
      const {
        accountIndex,
        accountName,
        derivationType,
        walletId,
        targetNetworks,
      } = props;
      const publicKey = await getCardanoXpub(accountIndex, derivationType);

      return cardanoAccountsFromXpub({
        state,
        walletId,
        accountIndex,
        accountName,
        targetNetworks,
        publicKey,
      });
    },
  },
  makeBitcoinHwAccountConnector({ getConnect: getTrezorBitcoinConnectWeb }),
];

export default loadHwAccountConnector;
