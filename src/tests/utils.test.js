import { describe, it, expect } from 'vitest'

// ── Utilitaires purs extraits inline pour les tests ───────────────────────
const formatMoney = (amount) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount || 0)

const formatElapsed = (date) => {
  if (!date) return '—'
  const diff = Math.floor((Date.now() - new Date(date)) / 60000)
  if (diff < 1)  return '< 1 min'
  if (diff < 60) return `${diff} min`
  return `${Math.floor(diff / 60)}h${String(diff % 60).padStart(2, '0')}`
}

// ── formatMoney ───────────────────────────────────────────────────────────
describe('formatMoney', () => {
  it('formate un montant et contient le chiffre', () => {
    const result = formatMoney(5000)
    expect(result).toContain('5')
    // Accepte XOF ou F CFA selon l'environnement (jsdom vs navigateur)
    expect(result.toLowerCase()).toMatch(/xof|cfa|fcfa/)
  })

  it('affiche 0 pour valeur nulle', () => {
    expect(formatMoney(null)).toContain('0')
    expect(formatMoney(undefined)).toContain('0')
  })

  it('retourne une chaîne non vide pour tout montant positif', () => {
    expect(formatMoney(1500000).length).toBeGreaterThan(0)
    expect(formatMoney(1500000)).toContain('1')
  })
})

// ── formatElapsed ─────────────────────────────────────────────────────────
describe('formatElapsed', () => {
  it('retourne — pour date nulle', () => {
    expect(formatElapsed(null)).toBe('—')
    expect(formatElapsed(undefined)).toBe('—')
  })

  it('retourne < 1 min pour les toutes récentes', () => {
    const now = new Date().toISOString()
    expect(formatElapsed(now)).toBe('< 1 min')
  })

  it('retourne les minutes pour < 1h', () => {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    expect(formatElapsed(tenMinAgo)).toBe('10 min')
  })

  it('retourne le format hHmm pour >= 1h', () => {
    const oneHourAgo = new Date(Date.now() - 75 * 60 * 1000).toISOString()
    expect(formatElapsed(oneHourAgo)).toBe('1h15')
  })
})

// ── Calcul de monnaie ─────────────────────────────────────────────────────
describe('calcul rendu de monnaie', () => {
  const computeChange = (cashReceived, paymentAmount) =>
    Math.max(0, cashReceived - paymentAmount)

  it('rendu positif quand client donne plus', () => {
    expect(computeChange(5000, 3200)).toBe(1800)
  })

  it('pas de rendu quand montant exact', () => {
    expect(computeChange(3200, 3200)).toBe(0)
  })

  it('pas de rendu négatif si moins donné', () => {
    expect(computeChange(2000, 3200)).toBe(0)
  })
})
