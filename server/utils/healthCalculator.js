const DIMENSION_KEYS = [
  'sprintPlanningEffectiveness',
  'backlogReadiness',
  'teamCollaboration',
  'dailyScrumEffectiveness',
  'sprintExecutionDiscipline',
  'sprintReviewQuality',
  'retrospectiveEffectiveness'
]

export function calculateOverallScore(dimensions, outcome) {
  const missing = DIMENSION_KEYS.filter(
    (key) => !dimensions[key] || typeof dimensions[key].rating !== 'number'
  )
  if (missing.length > 0) {
    throw new Error(`Missing ratings for: ${missing.join(', ')}`)
  }

  const totalRating = DIMENSION_KEYS.reduce((sum, key) => {
    const rating = dimensions[key].rating
    if (rating < 1 || rating > 5) {
      throw new Error(`${key} rating must be between 1 and 5`)
    }
    return sum + rating
  }, 0)

  const averageRating = totalRating / DIMENSION_KEYS.length
  const baseScore = (averageRating / 5) * 100

  const outcomeMultipliers = {
    Success: 1.0,
    AtRisk: 0.8,
    Failure: 0.5
  }

  const multiplier = outcomeMultipliers[outcome] ?? 1.0
  const finalScore = baseScore * multiplier

  return Math.round(finalScore * 10) / 10
}

export function calculateRAGStatus(score) {
  if (score < 50) return 'Red'
  if (score <= 75) return 'Amber'
  return 'Green'
}

export function validateDimensions(dimensions) {
  const errors = []

  DIMENSION_KEYS.forEach((key) => {
    if (!dimensions[key]) {
      errors.push(`${key} is required`)
      return
    }

    const rating = dimensions[key].rating
    if (typeof rating !== 'number') {
      errors.push(`${key}.rating must be a number`)
    } else if (rating < 1 || rating > 5) {
      errors.push(`${key}.rating must be between 1 and 5`)
    }
  })

  return errors
}

export function getHealthTrend(previousScore, currentScore) {
  if (!previousScore) return { direction: 'new', percentage: 0 }

  const difference = currentScore - previousScore
  const percentageChange = Math.round((difference / previousScore) * 100)

  let direction = 'stable'
  if (difference > 2) direction = 'improving'
  if (difference < -2) direction = 'declining'

  return {
    direction,
    percentage: Math.abs(percentageChange),
    difference: Math.round(difference * 10) / 10
  }
}

export const dimensionKeys = DIMENSION_KEYS
