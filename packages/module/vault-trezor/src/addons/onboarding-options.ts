import { WalletType } from '@lace-contract/wallet-repo';

import {
  TREZOR_BRIDGE_PLACEHOLDER_SERIAL,
  TREZOR_ONBOARDING_OPTION_ID,
  TREZOR_USB_PRODUCT_ID,
  TREZOR_USB_VENDOR_ID,
} from '../const';

import type { AvailableAddons } from '..';
import type { ContextualLaceInit } from '@lace-contract/module';
import type { OnboardingOption } from '@lace-contract/onboarding-v2';

const loadOnboardingOptions: ContextualLaceInit<
  OnboardingOption[],
  AvailableAddons
> = () => [
  {
    id: TREZOR_ONBOARDING_OPTION_ID,
    walletType: WalletType.HardwareTrezor,
    isHwDevice: true,
    device: {
      id: TREZOR_ONBOARDING_OPTION_ID,
      name: 'TREZOR',
      models: [],
      logo: 'Trezor',
    },
    usbFilters: [
      { vendorId: TREZOR_USB_VENDOR_ID, productId: TREZOR_USB_PRODUCT_ID },
    ],
    usbFallbackDevice: {
      kind: 'usb',
      vendorId: TREZOR_USB_VENDOR_ID,
      productId: TREZOR_USB_PRODUCT_ID,
      serialNumber: TREZOR_BRIDGE_PLACEHOLDER_SERIAL,
    },
    derivationTypes: ['ICARUS', 'ICARUS_TREZOR', 'LEDGER'],
  },
];

export default loadOnboardingOptions;
