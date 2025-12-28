import React from 'react'
import { useFormContext } from 'react-hook-form'
import type { WaiverFormInput } from '../../hooks/useWaiverForm'
import { SignatureField, type SignatureValue } from '../SignatureField'
import { useI18n } from '../../../../shared/i18n/I18nProvider'
import { SectionCard } from '../common/SectionCard'
import { Field, checkboxClasses, inputBaseClasses } from '../common/Field'

const clauseKeys: { key: keyof WaiverFormInput['legalConfirmation']; titleKey: string; bodyKey: string }[] = [
  { key: 'riskInitials', titleKey: 'legalClauses.assumption.title', bodyKey: 'legalClauses.assumption.body' },
  { key: 'releaseInitials', titleKey: 'legalClauses.release.title', bodyKey: 'legalClauses.release.body' },
  { key: 'indemnificationInitials', titleKey: 'legalClauses.indemnification.title', bodyKey: 'legalClauses.indemnification.body' },
  { key: 'mediaInitials', titleKey: 'legalClauses.media.title', bodyKey: 'legalClauses.media.body' },
]

const EMPTY_SIGNATURE: SignatureValue = { pngDataUrl: '', vectorJson: [] }

export const LegalConfirmationStep: React.FC = () => {
  const { t } = useI18n()
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<WaiverFormInput>()

  const signatureValue = watch('legalConfirmation.signature') as SignatureValue | undefined

  const legalError = <K extends keyof WaiverFormInput['legalConfirmation']>(key: K) =>
    errors.legalConfirmation?.[key]?.message

  return (
    <div className="space-y-6">
      <SectionCard
        title={t('legalConfirmation.title')}
        subtitle={t('legalConfirmation.description')}
      >
        <div className="space-y-6">
          {clauseKeys.map(({ key, titleKey, bodyKey }) => (
            <div key={key} className="space-y-2 rounded-xl border border-brand-outline/40 bg-brand-surface-variant/40 p-5">
              <h3 className="text-sm font-semibold text-brand-on-surface">{t(titleKey)}</h3>
              <p className="text-sm leading-relaxed text-brand-secondary/85">{t(bodyKey)}</p>
              <Field
                label={t(`legalConfirmation.fields.${key}`)}
                error={legalError(key) || undefined}
                className="max-w-[120px]"
              >
                <input
                  type="text"
                  maxLength={2}
                  className={`${inputBaseClasses} text-center uppercase tracking-[0.25em]`}
                  {...register(`legalConfirmation.${key}`)}
                />
              </Field>
            </div>
          ))}

          <div className="rounded-xl border border-brand-outline/40 bg-brand-surface-variant/60 p-5">
            <h3 className="text-sm font-semibold text-brand-on-surface">{t('legalClauses.acknowledgement.title')}</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-secondary/85">{t('legalClauses.acknowledgement.body')}</p>
            <label className="mt-4 flex items-start gap-3 text-sm font-medium text-brand-on-surface">
              <input type="checkbox" className={checkboxClasses} {...register('legalConfirmation.acceptedTerms')} />
              <span>{t('legalConfirmation.fields.acceptedTerms')}</span>
            </label>
            {legalError('acceptedTerms') && (
              <p className="mt-2 text-xs font-medium text-brand-error">{legalError('acceptedTerms')}</p>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={t('legalConfirmation.fields.signature.label')}
        subtitle={t('legalConfirmation.fields.signature.instructions')}
      >
        <div className="space-y-3">
          <SignatureField
            value={signatureValue ?? EMPTY_SIGNATURE}
            onChange={(next) =>
              setValue('legalConfirmation.signature', next, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          {legalError('signature') && (
            <p className="text-xs font-medium text-brand-error">{legalError('signature')}</p>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
