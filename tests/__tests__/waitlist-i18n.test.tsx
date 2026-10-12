import React from 'react';
import { render, screen } from '@testing-library/react';
import PremiumWaitlist from '@/app/waitlist/page';
import { StellarWalletProvider } from '@/components/context/StellarWalletProvider';
import '@/lib/i18n';
import '@testing-library/jest-dom';

// Real initialized i18next (lib/i18n.ts), NO useTranslation mock:
// with the base code (next-i18next, uninitialised) lookups miss and the UI
// renders raw key strings (issue #22). With the fix (react-i18next, default
// namespace) the real English strings resolve.
global.fetch = jest.fn();

describe('PremiumWaitlist real i18n (issue #22)', () => {
  it.each([
    ['en', 'Unlock the Future of'],
    ['es', 'Desbloquea el Futuro de'],
  ])('resolves the hero title in %s, not raw keys', async (lng, expected) => {
    const i18n = (await import('@/lib/i18n')).default;
    await i18n.changeLanguage(lng);
    render(
      <StellarWalletProvider>
        <PremiumWaitlist />
      </StellarWalletProvider>,
    );
    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(screen.queryByText('waitlist.title')).not.toBeInTheDocument();
    await i18n.changeLanguage('en');
  });

  it('renders resolved English copy, not raw keys', () => {
    render(
      <StellarWalletProvider>
        <PremiumWaitlist />
      </StellarWalletProvider>,
    );

    expect(screen.getByText('Unlock the Future of')).toBeInTheDocument();
    expect(screen.queryByText('waitlist.title')).not.toBeInTheDocument();
  });
});
