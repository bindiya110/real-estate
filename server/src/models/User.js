import mongoose from 'mongoose';

export const ROLES = ['user', 'agent', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'user', index: true },
    avatar: { type: String, default: '' },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    bio: { type: String, trim: true, maxlength: 1000, default: '' },
    // Public agent profile fields (only shown for role=agent)
    agency: { type: String, trim: true, maxlength: 120, default: '' },
    designation: { type: String, trim: true, maxlength: 80, default: '' },
    city: { type: String, trim: true, maxlength: 80, default: '' },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    passwordChangedAt: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ name: 'text', email: 'text', agency: 'text', city: 'text' });
userSchema.index({ createdAt: -1 });

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.passwordChangedAt;
    delete ret.__v;
    return ret;
  },
});

/** Fields safe to expose for any public profile (agents directory, listing contact). */
export const PUBLIC_USER_FIELDS = 'name avatar role bio agency designation city phone email createdAt';

export default mongoose.model('User', userSchema);
