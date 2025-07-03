import {createLocalizedPathnamesNavigation} from 'next-intl/navigation';

export const locales = ['en', 'pt-BR'] as const;
export const localePrefix = 'always';

export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({locales, localePrefix});
