import mongoose from 'mongoose';

/**
 * Tracks every stored image so the server can verify ownership before attaching it to a
 * listing or deleting it, and can clean up images that were uploaded but never used.
 */
const uploadSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, maxlength: 1000 },
    publicId: { type: String, required: true, maxlength: 300 },
    provider: { type: String, enum: ['cloudinary', 'local', 'external'], required: true },
    kind: { type: String, enum: ['property', 'avatar'], default: 'property' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', index: true },
    bytes: { type: Number },
    mimeType: { type: String },
  },
  { timestamps: true },
);

uploadSchema.index({ property: 1, createdAt: 1 });

export default mongoose.model('Upload', uploadSchema);
