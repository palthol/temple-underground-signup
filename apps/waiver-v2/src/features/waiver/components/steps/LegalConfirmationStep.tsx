import React from 'react'
import { useFormContext } from 'react-hook-form'
import type { WaiverFormInput } from '../../hooks/useWaiverForm'
import { SignatureField, type SignatureValue } from '../SignatureField'
import { useI18n } from '../../../../shared/i18n/I18nProvider'

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
      <section className="space-y-6">
        {clauseKeys.map(({ key, titleKey, bodyKey }) => (
          <article key={key} className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">{t(titleKey)}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{t(bodyKey)}</p>
            <label className="block text-sm font-medium text-slate-700">
              Initials
              <input
                type="text"
                maxLength={2}
                className="mt-1 w-24 rounded border border-slate-300 p-2 text-center uppercase"
                {...register(`legalConfirmation.${key}`)}
              />
            </label>
            {legalError(key) && <p className="text-xs text-red-600">{legalError(key)}</p>}
          </article>
        ))}

        <article className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">{t('legalClauses.acknowledgement.title')}</h3>
          <p className="text-sm leading-relaxed text-slate-600">{t('legalClauses.acknowledgement.body')}</p>
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" {...register('legalConfirmation.acceptedTerms')} />
            <span>I acknowledge and accept all clauses above.</span>
          </label>
          {legalError('acceptedTerms') && (
            <p className="text-xs text-red-600">{legalError('acceptedTerms')}</p>
          )}
        </article>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Signature</h3>
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
          <p className="text-xs text-red-600">{legalError('signature')}</p>
        )}
      </section>
    </div>
  )
}
