export type TrainingGoal =
  | 'first-class'
  | 'fitness-confidence'
  | 'competition'
  | 'weight-management'
  | 'youth-inquiry'

export interface LeadPayload {
  name: string
  email?: string
  phone?: string
  goals: TrainingGoal
  preferredTime: string
  notes?: string
}

export interface LeadResponse {
  success: boolean
  message: string
}

export type LeadSubmitStrategy = 'endpoint' | 'mailto'
