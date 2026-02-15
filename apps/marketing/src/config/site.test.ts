import { describe, expect, it } from 'vitest'
import { siteConfig } from './site'

describe('siteConfig', () => {
  it('contains all core pricing tiers', () => {
    expect(siteConfig.pricing.monthly).toHaveLength(3)
    expect(siteConfig.pricing.monthly.map((plan) => plan.tier)).toEqual(['$100', '$150', '$200'])
  })

  it('contains weekday and sunday schedule blocks', () => {
    expect(siteConfig.schedule.weekdays.length).toBeGreaterThan(0)
    expect(siteConfig.schedule.sunday.length).toBe(1)
  })
})
