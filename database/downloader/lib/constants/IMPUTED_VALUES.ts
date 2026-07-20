// Values used in imputing missing values

// Solar-based fallback stellar properties
export const IMPUTED_STAR_TEMPERATURE = 5778
export const IMPUTED_STAR_RADIUS = 1
export const IMPUTED_STAR_LUMINOSITY = 0
export const IMPUTED_STAR_CHROMOSPHERIC_ACTIVITY = -4.9

// Photometric fallback magnitudes used for system-level rendering fields
export const IMPUTED_STAR_APPARENT_MAGNITUDE = 9.83
export const IMPUTED_STAR_K_MAGNITUDE = 8.28
export const IMPUTED_STAR_W1_MAGNITUDE = 8.28
export const IMPUTED_STAR_W4_MAGNITUDE = 8.28

// Coordinate fallbacks (to avoid NaNs)
export const IMPUTED_COORD = 1e-6 // Epsilon
