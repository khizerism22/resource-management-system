import mongoose from 'mongoose'

const { Schema } = mongoose

const projectSchema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200
    },
    client: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      default: null
    },
    methodology: {
      type: String,
      required: true,
      enum: ['Scrum', 'Kanban']
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'OnHold', 'Completed']
    },
    assignedResources: {
      type: [Schema.Types.ObjectId],
      ref: 'ResourceAllocation',
      default: []
    },
    currentHealth: {
      type: String,
      enum: ['Green', 'Amber', 'Red'],
      default: 'Green'
    }
  },
  { timestamps: true }
)

projectSchema.pre('validate', function projectDateCheck(next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    return next(new Error('endDate must be on or after startDate'))
  }
  return next()
})

export default mongoose.model('Project', projectSchema)
