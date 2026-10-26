import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    role: { type: String, trim: true, maxlength: 80, default: '' },
    content: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    avatar: { type: String, trim: true, maxlength: 1000, default: '' },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

testimonialSchema.index({ isPublished: 1, createdAt: -1 });

export default mongoose.model('Testimonial', testimonialSchema);
