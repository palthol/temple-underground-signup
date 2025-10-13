import React from 'react'
import { useFormContext } from 'react-hook-form'
import type { WaiverFormInput } from '../../hooks/useWaiverForm'
import { SignatureField, type SignatureValue } from '../SignatureField'

const initialsFields: { key: keyof WaiverFormInput['legalConfirmation']; label: string }[] = [
  { key: 'riskInitials', label: 'Risk initials' },
  { key: 'releaseInitials', label: 'Release initials' },
  { key: 'indemnificationInitials', label: 'Indemnification initials' },
  { key: 'mediaInitials', label: 'Media initials' },
]

const EMPTY_SIGNATURE: SignatureValue = { pngDataUrl: '', vectorJson: [] }

export const LegalConfirmationStep: React.FC = () => {
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
      <section className="space-y-4">
        <h3 className="text-sm font-semibold">Initial the clauses below</h3>
        {initialsFields.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium">{label}</label>
            <input
              type="text"
              maxLength={2}
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm uppercase"
              {...register(`legalConfirmation.${key}`)}
            />
            {legalError(key) && <p className="mt-1 text-xs text-red-600">{legalError(key)}</p>}
          </div>
        ))}

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('legalConfirmation.acceptedTerms')} />
          <span>I acknowledge and accept all clauses above.</span>
        </label>
        {legalError('acceptedTerms') && (
          <p className="text-xs text-red-600">{legalError('acceptedTerms')}</p>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold">Signature</h3>
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
