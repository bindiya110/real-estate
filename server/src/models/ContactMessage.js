import mongoose from 'mongoose';

export const CONTACT_STATUSES = ['new', 'in-progress', 'resolved'];

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    subject: { type: String, required: true, trim: true, maxlength: 140 },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    status: { type: String, enum: CONTACT_STATUSES, default: 'new' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

contactMessageSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('ContactMessage', contactMessageSchema);
