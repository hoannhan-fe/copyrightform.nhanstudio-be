import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    required: true
  },
  technologies: {
    type: [String],
    default: []
  },
  link: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  descriptions: {
    type: [String],
    default: []
  },
  contentTimeline: {
    type: [{
      type: {
        type: String,
        enum: ['image', 'description'],
        required: true
      },
      content: {
        type: String,
        required: true
      },
      id: {
        type: String,
        required: true
      }
    }],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Convert _id to id for consistency
projectSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project;
