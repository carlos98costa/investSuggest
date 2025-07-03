import {
  createLocalizedPathnamesNavigation,
  Pathnames,
} from 'next-intl/navigation';

export const locales = ['en', 'pt-BR'] as const;
export const localePrefix = 'always';

export const pathnames = {
  '/': '/',
} satisfies Pathnames<typeof locales>;

export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({
    locales,
    localePrefix,
    pathnames,
  });
