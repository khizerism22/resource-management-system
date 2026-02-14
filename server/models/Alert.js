import mongoose from 'mongoose'

const { Schema } = mongoose

const alertSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'sprint_failure',
        'sprint_at_risk',
        'over_allocation',
        'project_deadline',
        'resource_conflict',
        'system'
      ]
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null
    },
    sprint: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
      default: null
    },
    resource: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null
    }
  },
  { timestamps: true }
)

alertSchema.index({ user: 1, isRead: 1, createdAt: -1 })
alertSchema.index({ type: 1, severity: 1 })

export default mongoose.model('Alert', alertSchema)
