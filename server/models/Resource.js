import mongoose from 'mongoose'

const { Schema } = mongoose

const resourceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.every((s) => typeof s === 'string'),
        message: 'Skills must be an array of strings'
      }
    },
    employmentType: {
      type: String,
      required: true,
      enum: ['FullTime', 'PartTime', 'Contractor']
    },
    availabilityPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    costRate: {
      type: Number,
      min: 0,
      default: null
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
)

export default mongoose.model('Resource', resourceSchema)
