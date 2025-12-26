const ENGLISH_COPY = {
  release: {
    title: 'Release',
    body:
      'In full consideration of the above mentioned risks and hazards and the fact that I am willingly and voluntarily participating in the activities made available by Temple Underground BJJ, I hereby waive, release, remise and discharge Temple Underground BJJ and its agents, officers, principals, employees, and volunteers, of any and all liability, claims, demands, actions or rights of action, or damages of any kind related to, arising from, or in any way connected with my participation in Temple Underground BJJ fitness programs/classes, including those allegedly attributed to the negligent acts or omissions of the above mentioned parties. This agreement shall be binding upon me, my successors, representatives, heirs, executors, assigns, or transferees. If any portion of this agreement is held invalid, the remainder shall remain in full legal force and effect. If signing on behalf of a minor, I give permission for Temple Underground BJJ to administer first aid and to seek medical care as deemed necessary.',
  },
  indemnification: {
    title: 'Indemnification',
    body:
      'I recognize that there is risk involved in the types of activities offered by Temple Underground BJJ. I accept financial responsibility for any injury that I or the participant may cause either to him/herself or to any other participant due to negligence. Should Temple Underground BJJ or anyone acting on their behalf be required to incur attorney’s fees and costs to enforce this agreement, I agree to reimburse them for such fees and costs. I further agree to indemnify and hold harmless Temple Underground BJJ, their principals, agents, employees, and volunteers from liability for the injury or death of any person(s) and damage to property that may result from my negligent or intentional act or omission while participating in activities offered by Temple Underground BJJ.',
  },
  media: {
    title: 'Use of Picture / Film / Likeness',
    body:
      'I agree to allow Temple Underground BJJ, its agents, officers, principals, employees and volunteers to use picture(s), film and/or likeness of me for advertising purposes. If I choose not to allow the use of the same for said purpose, I agree that I must inform Temple Underground BJJ of this in writing.',
  },
  acknowledgement: {
    title: 'Acknowledgement',
    body:
      'I have fully read and fully understand the foregoing assumption of risk and release of liability and I understand that by signing it obligates me to indemnify the parties named for any liability for injury or death of any person and damage to property caused by my negligent or intentional act or omission. I understand that by signing this form I am waiving valuable legal rights.',
  },
}

const SPANISH_COPY = {
  release: {
    title: 'Liberación',
    body:
      'En plena consideración de los riesgos y peligros mencionados anteriormente y del hecho de que participo de manera voluntaria y con pleno consentimiento en las actividades ofrecidas por Temple Underground BJJ, por la presente renuncio, libero, desisto y exonero a Temple Underground BJJ y a sus agentes, directivos, responsables, empleados y voluntarios de toda responsabilidad, reclamación, demanda, acción o derecho de acción, o daños de cualquier tipo relacionados, derivados o de alguna manera conectados con mi participación en los programas/clases de acondicionamiento físico de Temple Underground BJJ, incluyendo aquellos que se atribuyan presuntamente a actos u omisiones negligentes de las partes mencionadas. Este acuerdo será vinculante para mí, mis sucesores, representantes, herederos, albaceas, cesionarios o beneficiarios. Si firmo en nombre de un menor, otorgo permiso a Temple Underground BJJ para administrar primeros auxilios y buscar atención médica según se considere necesario.',
  },
  indemnification: {
    title: 'Indemnización',
    body:
      'Reconozco que existe riesgo en los tipos de actividades que ofrece Temple Underground BJJ. Acepto la responsabilidad financiera por cualquier lesión que yo o el participante podamos causar, ya sea a nosotros mismos o a cualquier otro participante, por negligencia. Si Temple Underground BJJ o alguien que actúe en su nombre incurre en honorarios legales y costos para hacer cumplir este acuerdo, acepto reembolsarlos por dichos honorarios y costos. Además, acepto indemnizar y mantener indemnes a Temple Underground BJJ, sus directivos, agentes, empleados y voluntarios de la responsabilidad por lesión o muerte de cualquier persona y daños a la propiedad que puedan resultar de mi acto u omisión negligente o intencional mientras participo en las actividades ofrecidas por Temple Underground BJJ.',
  },
  media: {
    title: 'Uso de Imagen / Filmación / Apariencia',
    body:
      'Acepto permitir a Temple Underground BJJ, sus agentes, oficiales, directivos, empleados y voluntarios utilizar mi imagen, fotografías y/o videos con fines publicitarios. Si elijo no permitir dicho uso, acepto informar a Temple Underground BJJ por escrito.',
  },
  acknowledgement: {
    title: 'Reconocimiento',
    body:
      'He leído y comprendo completamente la anterior asunción de riesgo y liberación de responsabilidad, y entiendo que al firmarla me obligo a indemnizar a las partes mencionadas por cualquier responsabilidad ante lesión o muerte de cualquier persona y daños a la propiedad causados por mi acto u omisión negligente o intencional. Entiendo que al firmar este formulario renuncio a valiosos derechos legales.',
  },
}

const LEGAL_COPY_BY_LOCALE = {
  en: ENGLISH_COPY,
  'en-us': ENGLISH_COPY,
  'en-ca': ENGLISH_COPY,
  es: SPANISH_COPY,
  'es-es': SPANISH_COPY,
  'es-mx': SPANISH_COPY,
}

export const getLegalCopy = (locale) => {
  if (!locale) return ENGLISH_COPY
  const normalized = locale.toLowerCase()
  const direct = LEGAL_COPY_BY_LOCALE[normalized]
  if (direct) return direct
  const language = normalized.split('-')[0]
  return LEGAL_COPY_BY_LOCALE[language] ?? ENGLISH_COPY
}