import mongoose from 'mongoose'

const { Schema } = mongoose

const sprintSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    sprintNumber: {
      type: Number,
      required: true,
      min: 1
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    sprintGoal: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    sprintType: {
      type: String,
      required: true,
      enum: ['Delivery', 'Hardening', 'Discovery']
    },
    goalAchievement: {
      type: String,
      enum: ['Achieved', 'PartiallyAchieved', 'NotAchieved'],
      default: 'Achieved'
    },
    overallOutcome: {
      type: String,
      enum: ['Success', 'AtRisk', 'Failure'],
      default: 'Success'
    },
    failureReasons: {
      type: [String],
      enum: ['ScopeChange', 'Dependency', 'ResourceIssues', 'TechnicalDebt', 'ExternalFactors'],
      default: []
    },
    comments: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ''
    }
  },
  { timestamps: true }
)

sprintSchema.pre('validate', function sprintDateCheck(next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    return next(new Error('endDate must be on or after startDate'))
  }
  return next()
})

sprintSchema.index({ project: 1, sprintNumber: 1 }, { unique: true })

export default mongoose.model('Sprint', sprintSchema)
