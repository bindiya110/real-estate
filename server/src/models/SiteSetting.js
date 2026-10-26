import mongoose from 'mongoose';

const siteSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    siteName: { type: String, trim: true, maxlength: 60, default: 'EstateHub' },
    tagline: { type: String, trim: true, maxlength: 140, default: 'Find a place that feels like home' },
    heroTitle: { type: String, trim: true, maxlength: 120, default: 'Find a home that fits the way you live' },
    heroSubtitle: {
      type: String,
      trim: true,
      maxlength: 300,
      default: 'Browse verified homes for sale and rent, compare neighbourhoods, and talk directly to trusted agents.',
    },
    heroImage: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80',
    },
    contactEmail: { type: String, trim: true, maxlength: 254, default: 'hello@estatehub.example' },
    contactPhone: { type: String, trim: true, maxlength: 30, default: '+91 98765 43210' },
    address: { type: String, trim: true, maxlength: 200, default: '4th Floor, Prestige Tower, MG Road, Bengaluru 560001' },
    socialLinks: {
      facebook: { type: String, trim: true, maxlength: 300, default: '' },
      instagram: { type: String, trim: true, maxlength: 300, default: '' },
      linkedin: { type: String, trim: true, maxlength: 300, default: '' },
      twitter: { type: String, trim: true, maxlength: 300, default: '' },
    },
  },
  { timestamps: true },
);

siteSettingSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    delete ret.key;
    return ret;
  },
});

siteSettingSchema.statics.getSingleton = async function getSingleton() {
  return this.findOneAndUpdate({ key: 'site' }, { $setOnInsert: { key: 'site' } }, { upsert: true, new: true });
};

export default mongoose.model('SiteSetting', siteSettingSchema);
