import mongoose from 'mongoose';

export const INQUIRY_STATUSES = ['new', 'read', 'replied', 'closed'];

const inquirySchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    status: { type: String, enum: INQUIRY_STATUSES, default: 'new' },
  },
  { timestamps: true },
);

inquirySchema.index({ recipient: 1, createdAt: -1 });
inquirySchema.index({ sender: 1, createdAt: -1 });
inquirySchema.index({ property: 1 });
inquirySchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Inquiry', inquirySchema);
