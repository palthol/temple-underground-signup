import React from 'react'
import { useFormContext } from 'react-hook-form'
import type { WaiverFormInput } from '../../hooks/useWaiverForm'
import { useI18n } from '../../../../shared/i18n/I18nProvider'

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
      <header className="space-y-2">
        <h2 className="text-base font-semibold text-slate-800">{t('personalInfo.title')}</h2>
        <p className="text-sm text-slate-600">{t('personalInfo.description')}</p>
      </header>

      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">{t('personalInfo.fields.fullName')}</label>
          <input
            type="text"
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            {...register(field('fullName'))}
          />
          {errorMessage('fullName') && <p className="mt-1 text-xs text-red-600">{errorMessage('fullName')}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">{t('personalInfo.fields.dateOfBirth')}</label>
          <input
            type="date"
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            {...register(field('dateOfBirth'))}
          />
          {errorMessage('dateOfBirth') && <p className="mt-1 text-xs text-red-600">{errorMessage('dateOfBirth')}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">{t('personalInfo.fields.addressLine1')}</label>
          <input
            type="text"
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            {...register(field('addressLine1'))}
          />
          {errorMessage('addressLine1') && <p className="mt-1 text-xs text-red-600">{errorMessage('addressLine1')}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">{t('personalInfo.fields.addressLine2')}</label>
          <input
            type="text"
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            {...register(field('addressLine2'))}
          />
          {errorMessage('addressLine2') && <p className="mt-1 text-xs text-red-600">{errorMessage('addressLine2')}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">{t('personalInfo.fields.city')}</label>
            <input
              type="text"
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              {...register(field('city'))}
            />
            {errorMessage('city') && <p className="mt-1 text-xs text-red-600">{errorMessage('city')}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">{t('personalInfo.fields.state')}</label>
            <input
              type="text"
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              {...register(field('state'))}
            />
            {errorMessage('state') && <p className="mt-1 text-xs text-red-600">{errorMessage('state')}</p>}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">{t('personalInfo.fields.postalCode')}</label>
            <input
              type="text"
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              {...register(field('postalCode'))}
            />
            {errorMessage('postalCode') && <p className="mt-1 text-xs text-red-600">{errorMessage('postalCode')}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">{t('personalInfo.fields.email')}</label>
            <input
              type="email"
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              {...register(field('email'))}
            />
            {errorMessage('email') && <p className="mt-1 text-xs text-red-600">{errorMessage('email')}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">{t('personalInfo.fields.phone')}</label>
          <input
            type="tel"
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            {...register(field('phone'))}
          />
          {errorMessage('phone') && <p className="mt-1 text-xs text-red-600">{errorMessage('phone')}</p>}
        </div>
      </div>

      <div className="space-y-3 border-t pt-4">
        <header className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-700">{t('personalInfo.fields.emergency.section')}</h3>
          <p className="text-xs text-slate-500">{t('personalInfo.fields.emergency.instructions')}</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t('personalInfo.fields.emergency.name')}
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              {...register('emergencyContact.name')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t('personalInfo.fields.emergency.relationship')}
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              {...register('emergencyContact.relationship')}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t('personalInfo.fields.emergency.phone')}
            </label>
            <input
              type="tel"
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              {...register('emergencyContact.phone')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t('personalInfo.fields.emergency.email')}
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              {...register('emergencyContact.email')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
