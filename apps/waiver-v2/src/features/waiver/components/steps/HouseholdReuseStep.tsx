import React from 'react'
import { useI18n } from '../../../../shared/i18n/I18nProvider'
import { SectionCard } from '../common/SectionCard'
import { checkboxClasses } from '../common/Field'

type ReuseOptions = {
  address: boolean
  guardianContact: boolean
  lastName: boolean
  emergencyContact: boolean
}

type HouseholdReuseStepProps = {
  options: ReuseOptions
  emergencyContactAvailable: boolean
  onChange: (next: ReuseOptions) => void
}

export const HouseholdReuseStep: React.FC<HouseholdReuseStepProps> = ({
  options,
  emergencyContactAvailable,
  onChange,
}) => {
  const { t } = useI18n()

  const toggle = (key: keyof ReuseOptions, checked: boolean) => {
    onChange({
      ...options,
      [key]: checked,
    })
  }

  return (
    <SectionCard
      title={t('householdReuse.title')}
      subtitle={t('householdReuse.description')}
    >
      <div className="space-y-4">
        <label className="flex items-start gap-3 text-sm font-medium text-brand-on-surface">
          <input
            type="checkbox"
            className={checkboxClasses}
            checked={options.address}
            onChange={(event) => toggle('address', event.target.checked)}
          />
          <span>
            {t('householdReuse.options.address')}
            <span className="mt-1 block text-xs font-normal text-brand-secondary/80">
              {t('householdReuse.options.addressHint')}
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 text-sm font-medium text-brand-on-surface">
          <input
            type="checkbox"
            className={checkboxClasses}
            checked={options.guardianContact}
            onChange={(event) => toggle('guardianContact', event.target.checked)}
          />
          <span>
            {t('householdReuse.options.guardianContact')}
            <span className="mt-1 block text-xs font-normal text-brand-secondary/80">
              {t('householdReuse.options.guardianContactHint')}
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 text-sm font-medium text-brand-on-surface">
          <input
            type="checkbox"
            className={checkboxClasses}
            checked={options.lastName}
            onChange={(event) => toggle('lastName', event.target.checked)}
          />
          <span>
            {t('householdReuse.options.lastName')}
            <span className="mt-1 block text-xs font-normal text-brand-secondary/80">
              {t('householdReuse.options.lastNameHint')}
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 text-sm font-medium text-brand-on-surface">
          <input
            type="checkbox"
            className={checkboxClasses}
            checked={options.emergencyContact}
            disabled={!emergencyContactAvailable}
            onChange={(event) => toggle('emergencyContact', event.target.checked)}
          />
          <span>
            {t('householdReuse.options.emergencyContact')}
            <span className="mt-1 block text-xs font-normal text-brand-secondary/80">
              {emergencyContactAvailable
                ? t('householdReuse.options.emergencyContactHint')
                : t('householdReuse.options.emergencyContactUnavailable')}
            </span>
          </span>
        </label>
      </div>
    </SectionCard>
  )
}

