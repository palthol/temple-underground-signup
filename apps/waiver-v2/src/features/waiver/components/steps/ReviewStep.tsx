import React from 'react'
import { useFormContext } from 'react-hook-form'
import type { WaiverFormInput } from '../../hooks/useWaiverForm'

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
    <div className="space-y-1 text-sm text-slate-600">{children}</div>
  </section>
)

const renderField = (label: string, value: React.ReactNode) => (
  <div>
    <span className="font-medium text-slate-700">{label}: </span>
    <span>{value || <em className="text-slate-400">Not provided</em>}</span>
  </div>
)

export const ReviewStep: React.FC = () => {
  const {
    getValues,
    register,
    formState: { errors },
  } = useFormContext<WaiverFormInput>()

  const values = getValues()
  const { personalInfo, emergencyContact, medicalInformation, legalConfirmation } = values

  return (
    <div className="space-y-6">
      <Section title="Personal Information">
        {renderField('Full name', personalInfo.fullName)}
        {renderField('Date of birth', personalInfo.dateOfBirth)}
        {renderField('Address line 1', personalInfo.addressLine1)}
        {renderField('Address line 2', personalInfo.addressLine2)}
        {renderField('City', personalInfo.city)}
        {renderField('State', personalInfo.state)}
        {renderField('Postal code', personalInfo.postalCode)}
        {renderField('Email', personalInfo.email)}
        {renderField('Phone', personalInfo.phone)}
      </Section>

      <Section title="Emergency Contact (optional)">
        {renderField('Name', emergencyContact.name)}
        {renderField('Relationship', emergencyContact.relationship)}
        {renderField('Phone', emergencyContact.phone)}
        {renderField('Email', emergencyContact.email)}
      </Section>

      <Section title="Medical Information">
        <div className="grid gap-2 md:grid-cols-2">
          {renderField('Heart disease', medicalInformation.heartDisease ? 'Yes' : 'No')}
          {renderField('Shortness of breath', medicalInformation.shortnessOfBreath ? 'Yes' : 'No')}
          {renderField('High blood pressure', medicalInformation.highBloodPressure ? 'Yes' : 'No')}
          {renderField('Smoking', medicalInformation.smoking ? 'Yes' : 'No')}
          {renderField('Diabetes', medicalInformation.diabetes ? 'Yes' : 'No')}
          {renderField('Family history', medicalInformation.familyHistory ? 'Yes' : 'No')}
          {renderField('Workouts', medicalInformation.workouts ? 'Yes' : 'No')}
          {renderField('Medication', medicalInformation.medication ? 'Yes' : 'No')}
          {renderField('Alcohol', medicalInformation.alcohol ? 'Yes' : 'No')}
        </div>
        {renderField('Last physical', medicalInformation.lastPhysical)}
        {renderField('Exercise restriction', medicalInformation.exerciseRestriction)}
        <div className="pt-2">
          <span className="font-medium text-slate-700">Injuries</span>
          <ul className="ml-4 list-disc text-sm text-slate-600">
            <li>Knees: {medicalInformation.injuries.knees ? 'Yes' : 'No'}</li>
            <li>Lower back: {medicalInformation.injuries.lowerBack ? 'Yes' : 'No'}</li>
            <li>Neck / shoulders: {medicalInformation.injuries.neckShoulders ? 'Yes' : 'No'}</li>
            <li>Hip / pelvis: {medicalInformation.injuries.hipPelvis ? 'Yes' : 'No'}</li>
            <li>
              Other: {medicalInformation.injuries.other.has ? 'Yes' : 'No'}{' '}
              {medicalInformation.injuries.other.has && `(${medicalInformation.injuries.other.details || 'Details missing'})`}
            </li>
          </ul>
        </div>
        <div className="pt-2 space-y-1">
          {renderField('Recent injury', medicalInformation.hadRecentInjury === 'yes' ? 'Yes' : 'No')}
          {medicalInformation.hadRecentInjury === 'yes' && (
            <>
              {renderField('Injury details', medicalInformation.injuryDetails)}
              {renderField('Physician cleared', medicalInformation.physicianCleared ?? 'Not answered')}
              {renderField('Clearance notes', medicalInformation.clearanceNotes)}
            </>
          )}
        </div>
      </Section>

      <Section title="Legal Confirmation">
        {renderField('Risk initials', legalConfirmation.riskInitials)}
        {renderField('Release initials', legalConfirmation.releaseInitials)}
        {renderField('Indemnification initials', legalConfirmation.indemnificationInitials)}
        {renderField('Media initials', legalConfirmation.mediaInitials)}
        <div>
          <span className="font-medium text-slate-700">Signature</span>
          {legalConfirmation.signature.pngDataUrl ? (
            <div className="mt-2 rounded border border-slate-200 bg-white p-2">
              <img
                src={legalConfirmation.signature.pngDataUrl}
                alt="Signature preview"
                className="h-32 w-full object-contain"
              />
            </div>
          ) : (
            <p className="text-sm text-slate-400">Signature not captured</p>
          )}
        </div>
      </Section>

      <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            {...register('review.confirmAccuracy', { required: true })}
          />
          <span>
            I confirm that the information provided is accurate and I agree to submit my waiver electronically.
          </span>
        </label>
        {errors.review?.confirmAccuracy && (
          <p className="text-xs text-red-600">{errors.review.confirmAccuracy.message as string}</p>
        )}
      </section>
    </div>
  )
}
