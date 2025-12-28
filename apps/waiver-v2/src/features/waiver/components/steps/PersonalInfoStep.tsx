import React from 'react'
import { useFormContext } from 'react-hook-form'
import type { WaiverFormInput } from '../../hooks/useWaiverForm'
import { useI18n } from '../../../../shared/i18n/I18nProvider'
import { SectionCard } from '../common/SectionCard'
import { Field, inputBaseClasses } from '../common/Field'

export const PersonalInfoStep: React.FC = () => {
  const { t } = useI18n()
  const {
    register,
    formState: { errors },
  } = useFormContext<WaiverFormInput>()

  const field = (path: keyof WaiverFormInput['personalInfo']) => `personalInfo.${path}` as const
  const errorMessage = (path: keyof WaiverFormInput['personalInfo']) => errors.personalInfo?.[path]?.message

  return (
    <div className="space-y-6">
      <SectionCard
        title={t('personalInfo.title')}
        subtitle={t('personalInfo.description')}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label={t('personalInfo.fields.fullName')} required error={errorMessage('fullName') || undefined}>
            <input type="text" className={inputBaseClasses} {...register(field('fullName'))} />
          </Field>
          <Field
            label={t('personalInfo.fields.dateOfBirth')}
            required
            error={errorMessage('dateOfBirth') || undefined}
          >
            <input type="date" className={inputBaseClasses} {...register(field('dateOfBirth'))} />
          </Field>
          <Field
            label={t('personalInfo.fields.addressLine1')}
            required
            error={errorMessage('addressLine1') || undefined}
          >
            <input type="text" className={inputBaseClasses} {...register(field('addressLine1'))} />
          </Field>
          <Field label={t('personalInfo.fields.addressLine2')} error={errorMessage('addressLine2') || undefined}>
            <input type="text" className={inputBaseClasses} {...register(field('addressLine2'))} />
          </Field>
          <Field label={t('personalInfo.fields.city')} required error={errorMessage('city') || undefined}>
            <input type="text" className={inputBaseClasses} {...register(field('city'))} />
          </Field>
          <Field label={t('personalInfo.fields.state')} required error={errorMessage('state') || undefined}>
            <input type="text" className={inputBaseClasses} {...register(field('state'))} />
          </Field>
          <Field label={t('personalInfo.fields.postalCode')} required error={errorMessage('postalCode') || undefined}>
            <input type="text" className={inputBaseClasses} {...register(field('postalCode'))} />
          </Field>
          <Field label={t('personalInfo.fields.email')} required error={errorMessage('email') || undefined}>
            <input type="email" className={inputBaseClasses} {...register(field('email'))} />
          </Field>
          <Field label={t('personalInfo.fields.phone')} required error={errorMessage('phone') || undefined}>
            <input type="tel" className={inputBaseClasses} {...register(field('phone'))} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        title={t('personalInfo.fields.emergency.section')}
        subtitle={t('personalInfo.fields.emergency.instructions')}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label={t('personalInfo.fields.emergency.name')}>
            <input type="text" className={inputBaseClasses} {...register('emergencyContact.name')} />
          </Field>
          <Field label={t('personalInfo.fields.emergency.relationship')}>
            <input type="text" className={inputBaseClasses} {...register('emergencyContact.relationship')} />
          </Field>
          <Field label={t('personalInfo.fields.emergency.phone')}>
            <input type="tel" className={inputBaseClasses} {...register('emergencyContact.phone')} />
          </Field>
          <Field label={t('personalInfo.fields.emergency.email')}>
            <input type="email" className={inputBaseClasses} {...register('emergencyContact.email')} />
          </Field>
        </div>
      </SectionCard>
    </div>
  )
}
