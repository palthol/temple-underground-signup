import React from 'react'
import { useFormContext } from 'react-hook-form'
import type { WaiverFormInput } from '../../hooks/useWaiverForm'

export const PersonalInfoStep: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<WaiverFormInput>()

  const field = (path: keyof WaiverFormInput['personalInfo']) => `personalInfo.${path}` as const
  const errorMessage = (path: keyof WaiverFormInput['personalInfo']) => errors.personalInfo?.[path]?.message

  return (
    <div className="grid gap-4">
      <div>
        <label className="block text-sm font-medium">Full Name</label>
        <input
          type="text"
          className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
          {...register(field('fullName'))}
        />
        {errorMessage('fullName') && (
          <p className="mt-1 text-xs text-red-600">{errorMessage('fullName')}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Date of Birth</label>
        <input
          type="date"
          className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
          {...register(field('dateOfBirth'))}
        />
        {errorMessage('dateOfBirth') && (
          <p className="mt-1 text-xs text-red-600">{errorMessage('dateOfBirth')}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Address Line 1</label>
        <input
          type="text"
          className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
          {...register(field('addressLine1'))}
        />
        {errorMessage('addressLine1') && (
          <p className="mt-1 text-xs text-red-600">{errorMessage('addressLine1')}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Address Line 2 (optional)</label>
        <input
          type="text"
          className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
          {...register(field('addressLine2'))}
        />
        {errorMessage('addressLine2') && (
          <p className="mt-1 text-xs text-red-600">{errorMessage('addressLine2')}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">City</label>
          <input
            type="text"
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            {...register(field('city'))}
          />
          {errorMessage('city') && (
            <p className="mt-1 text-xs text-red-600">{errorMessage('city')}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">State</label>
          <input
            type="text"
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            {...register(field('state'))}
          />
          {errorMessage('state') && (
            <p className="mt-1 text-xs text-red-600">{errorMessage('state')}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Postal Code</label>
          <input
            type="text"
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            {...register(field('postalCode'))}
          />
          {errorMessage('postalCode') && (
            <p className="mt-1 text-xs text-red-600">{errorMessage('postalCode')}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            {...register(field('email'))}
          />
          {errorMessage('email') && (
            <p className="mt-1 text-xs text-red-600">{errorMessage('email')}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input
          type="tel"
          className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
          {...register(field('phone'))}
        />
        {errorMessage('phone') && (
          <p className="mt-1 text-xs text-red-600">{errorMessage('phone')}</p>
        )}
      </div>

      <div className="mt-6 border-t pt-4">
        <h3 className="text-sm font-semibold">Emergency Contact (optional)</h3>
        <p className="mt-1 text-xs text-gray-500">
          Provide an emergency contact if available. Leaving these blank is acceptable.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Contact Name</label>
            <input
              type="text"
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              {...register('emergencyContact.name')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Relationship</label>
            <input
              type="text"
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              {...register('emergencyContact.relationship')}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Contact Phone</label>
            <input
              type="tel"
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              {...register('emergencyContact.phone')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Contact Email</label>
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


