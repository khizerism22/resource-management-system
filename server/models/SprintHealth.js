import mongoose from 'mongoose'

const { Schema } = mongoose

const ratingSchema = new Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    }
  },
  { _id: false }
)

const sprintHealthSchema = new Schema(
  {
    sprint: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
      required: true,
      unique: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    sprintPlanningEffectiveness: { type: ratingSchema, required: true },
    backlogReadiness: { type: ratingSchema, required: true },
    teamCollaboration: { type: ratingSchema, required: true },
    dailyScrumEffectiveness: { type: ratingSchema, required: true },
    sprintExecutionDiscipline: { type: ratingSchema, required: true },
    sprintReviewQuality: { type: ratingSchema, required: true },
    retrospectiveEffectiveness: { type: ratingSchema, required: true },
    overallHealthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    ragStatus: {
      type: String,
      enum: ['Green', 'Amber', 'Red'],
      default: 'Green'
    }
  },
  { timestamps: true }
)

function calculateScore(doc) {
  const ratings = [
    doc.sprintPlanningEffectiveness?.rating,
    doc.backlogReadiness?.rating,
    doc.teamCollaboration?.rating,
    doc.dailyScrumEffectiveness?.rating,
    doc.sprintExecutionDiscipline?.rating,
    doc.sprintReviewQuality?.rating,
    doc.retrospectiveEffectiveness?.rating
  ].filter((r) => typeof r === 'number')

  if (ratings.length === 0) return { score: 0, rag: 'Red' }

  const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
  const score = Math.round((avg / 5) * 100)
  let rag = 'Red'
  if (score >= 80) rag = 'Green'
  else if (score >= 60) rag = 'Amber'
  return { score, rag }
}

sprintHealthSchema.pre('validate', function sprintHealthCompute(next) {
  if (this.overallHealthScore !== null && this.overallHealthScore !== undefined && this.ragStatus) {
    return next()
  }
  const { score, rag } = calculateScore(this)
  this.overallHealthScore = score
  this.ragStatus = rag
  return next()
})

sprintHealthSchema.methods.recalculate = function recalculate() {
  const { score, rag } = calculateScore(this)
  this.overallHealthScore = score
  this.ragStatus = rag
  return { score, rag }
}

export default mongoose.model('SprintHealth', sprintHealthSchema)
