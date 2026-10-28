/**
 * Voliteľné časti systému, ktoré si tenant zapína v Nastaveniach.
 */

export const CONSIGNMENT_ENABLED_KEY = 'consignment_enabled'

/**
 * Komisný predaj — oddelená evidencia vozidiel prijatých od majiteľov vrátane
 * komitentov a provízií.
 *
 * Predvolene zapnutý: tenanti, ktorí existovali pred zavedením prepínača, ho
 * používajú a vypnutie by im skrylo rozrobené dáta.
 *
 * Vypnutie nič nemaže — existujúce komisné vozidlá zostanú v ponuke, len bez
 * oddeleného členenia a bez počítania provízie.
 */
export function isConsignmentEnabled(settings: Record<string, string>): boolean {
  return settings[CONSIGNMENT_ENABLED_KEY] !== 'false'
}
