export const AppRoute = {
  Pulse: '/pulse',
  Map: '/map',
  Scheduler: '/scheduler',
} as const;

export type AppRoute = typeof AppRoute[keyof typeof AppRoute];