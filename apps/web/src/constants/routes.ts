export const AppRoute = {
  Pulse: '/pulse',
  Map: '/map',
} as const;

export type AppRoute = typeof AppRoute[keyof typeof AppRoute];