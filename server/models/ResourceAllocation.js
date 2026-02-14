import mongoose from 'mongoose'

const { Schema } = mongoose

const resourceAllocationSchema = new Schema(
  {
    resource: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      required: true
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    allocationPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    sprint: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
      default: null
    }
  },
  { timestamps: true }
)

resourceAllocationSchema.pre('validate', function allocationDateCheck(next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    return next(new Error('endDate must be on or after startDate'))
  }
  return next()
})

resourceAllocationSchema.index({ resource: 1, project: 1, startDate: 1, endDate: 1 })

export default mongoose.model('ResourceAllocation', resourceAllocationSchema)
