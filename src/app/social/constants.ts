export const ANIMATION_CONFIG = {
  STAGGER_DELAY: 0.06,
  CARD_HOVER_Y: -4,
  CARD_TAP_SCALE: 0.98,
  CARD_ANIMATION_DURATION: 0.5,
  HEADER_ANIMATION_DURATION: 0.8,
  HOVER_RING_DURATION: 0.4,
  GRADIENT_SWEEP_DURATION: 500,
} as const;

export const COPY_FEEDBACK_DURATION = 1400;

export const SEARCH_CONFIG = {
  PLACEHOLDER: "Search socials, links, games, UIDs...",
} as const;

export const GRID_LAYOUT = {
  SOCIAL_GRID: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  GAME_GRID: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  GAP: "gap-6 md:gap-8",
} as const;