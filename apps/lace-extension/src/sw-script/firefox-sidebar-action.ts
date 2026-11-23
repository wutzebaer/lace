// Firefox counterpart of the Chromium side panel: the sidebar declared as
// `sidebar_action` in the Firefox manifest.
//
// Firefox runs the background as a non-persistent event page and only wakes a
// stopped page for listeners that were registered synchronously while the
// script first ran. This module is therefore wired up from the top of
// ./index.ts, not from ./load.ts (which is loaded after an await).

type SidebarAction = { toggle?: () => Promise<void> };

const getSidebarAction = (): SidebarAction | undefined =>
  (globalThis as { browser?: { sidebarAction?: SidebarAction } }).browser
    ?.sidebarAction;

export const hasFirefoxSidebarAction = (): boolean =>
  typeof getSidebarAction()?.toggle === 'function';

/**
 * Makes the toolbar action toggle the sidebar. Returns false (and registers
 * nothing) on browsers without `sidebarAction`.
 */
export const registerFirefoxSidebarToggle = (logger: {
  error: (...args: unknown[]) => void;
}): boolean => {
  const sidebarAction = getSidebarAction();
  if (typeof sidebarAction?.toggle !== 'function') return false;
  const toggle = sidebarAction.toggle.bind(sidebarAction);
  chrome.action.onClicked.addListener(() => {
    // Must stay synchronous: Firefox only honours sidebarAction calls made
    // directly inside the user-input handler.
    toggle().catch((error: unknown) => {
      logger.error('Failed to toggle the Firefox sidebar', error);
      void chrome.tabs.create({ url: 'expo/index.html', active: true });
    });
  });
  return true;
};
