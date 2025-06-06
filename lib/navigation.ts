import { IRoute } from '@/types/navigation';

export const isWindowAvailable = () => typeof window !== 'undefined';

export const findCurrentRoute = (routes: IRoute[], pathname: string): IRoute | undefined => {
  for (const route of routes) {
    if (pathname.includes(route.path)) return route;
  }
};

export const getActiveRoute = (routes: IRoute[], pathname: string): string => {
  const route = findCurrentRoute(routes, pathname);
  return route?.name || 'Dashboard';
};

export const getActiveNavbar = (routes: IRoute[], pathname: string): boolean => {
  const route = findCurrentRoute(routes, pathname);
  return !!route?.secondary;
};
