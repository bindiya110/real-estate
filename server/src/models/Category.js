import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    image: { type: String, trim: true, maxlength: 1000, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export default mongoose.model('Category', categorySchema);
