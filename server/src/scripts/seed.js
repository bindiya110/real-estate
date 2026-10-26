import { pathToFileURL } from 'node:url';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import env from '../config/env.js';
import { connectDB, disconnectDB } from '../config/database.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Category from '../models/Category.js';
import Testimonial from '../models/Testimonial.js';
import Favorite from '../models/Favorite.js';
import Inquiry from '../models/Inquiry.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import ContactMessage from '../models/ContactMessage.js';
import SiteSetting from '../models/SiteSetting.js';
import Upload from '../models/Upload.js';
import RefreshToken from '../models/RefreshToken.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import EmailVerificationToken from '../models/EmailVerificationToken.js';
import { slugify } from '../utils/slugify.js';

const img = (id, w = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const PHOTOS = {
  modern: 'photo-1600596542815-ffad4c1539a9',
  house1: 'photo-1600585154340-be6161a56a0c',
  luxury: 'photo-1512917774080-9991f1c4c750',
  house2: 'photo-1564013799919-ab600027ffc6',
  house3: 'photo-1568605114967-8130f3a36994',
  house4: 'photo-1570129477492-45c003edd2be',
  villa1: 'photo-1580587771525-78b9dba3b914',
  villa2: 'photo-1613490493576-7fde63acd811',
  apt1: 'photo-1502672260266-1c1ef2d93688',
  apt2: 'photo-1522708323590-d24dbb6b0267',
  apt3: 'photo-1560448204-e02f11c3d0e2',
  living: 'photo-1493809842364-78817add7ffb',
  kitchen: 'photo-1484154218962-a197022b5858',
  tower1: 'photo-1545324418-cc1a3fa10c00',
  tower2: 'photo-1574362848149-11496d93a7c7',
  int1: 'photo-1600607687939-ce8a6c25118c',
  int2: 'photo-1600566753190-17f0baa2a6c3',
  int3: 'photo-1600210492486-724fe5c67fb0',
  office1: 'photo-1497366216548-37526070297c',
  office2: 'photo-1486406146926-c627a92ad1ab',
  land: 'photo-1500382017468-9049fed747ef',
  bedroom: 'photo-1505691938895-1758d7feb511',
  living2: 'photo-1507089947368-19c1da9775ae',
  house5: 'photo-1588880331179-bc9b93a8cb5e',
  house6: 'photo-1599809275671-b5942cabc7a2',
};

const AVATARS = [
  'photo-1507003211169-0a1dd7228f2d',
  'photo-1494790108377-be9c29b29330',
  'photo-1500648767791-00dcc994a43e',
  'photo-1438761681033-6461ffad8d80',
  'photo-1472099645785-5658abf4ff4e',
];

const CATEGORIES = [
  { name: 'Apartments', description: 'City apartments and flats in gated communities', image: img(PHOTOS.tower1, 800) },
  { name: 'Villas', description: 'Independent villas with private gardens and pools', image: img(PHOTOS.villa1, 800) },
  { name: 'Independent Houses', description: 'Family homes with their own plot', image: img(PHOTOS.house3, 800) },
  { name: 'Luxury Homes', description: 'Premium residences with top-tier amenities', image: img(PHOTOS.luxury, 800) },
  { name: 'Commercial', description: 'Offices, retail and co-working spaces', image: img(PHOTOS.office2, 800) },
  { name: 'Plots & Land', description: 'Residential and agricultural plots', image: img(PHOTOS.land, 800) },
];

// [title, listingType, propertyType, category, price, city, state, address, beds, baths, area, furnishing, photos, amenities, featured, status]
const LISTINGS = [
  ['Skyline 3 BHK with Lake View', 'sale', 'apartment', 'Apartments', 14500000, 'Bengaluru', 'Karnataka', 'Hebbal Lake Road', 3, 3, 1850, 'semi-furnished', ['tower1', 'living', 'kitchen', 'bedroom'], ['parking', 'swimming-pool', 'gym', 'lift', 'security', 'power-backup', 'clubhouse'], true, 'approved'],
  ['Contemporary Villa with Private Pool', 'sale', 'villa', 'Villas', 42000000, 'Bengaluru', 'Karnataka', 'Whitefield, Palm Meadows', 4, 5, 4200, 'furnished', ['villa2', 'int1', 'int2', 'bedroom'], ['parking', 'swimming-pool', 'garden', 'security', 'air-conditioning', 'modular-kitchen', 'pet-friendly'], true, 'approved'],
  ['Cosy 1 BHK near Tech Park', 'rent', 'apartment', 'Apartments', 22000, 'Bengaluru', 'Karnataka', 'Bellandur, Outer Ring Road', 1, 1, 650, 'furnished', ['apt2', 'living2', 'kitchen'], ['lift', 'security', 'wifi', 'power-backup'], false, 'approved'],
  ['Sea-Facing Penthouse in Worli', 'sale', 'penthouse', 'Luxury Homes', 98000000, 'Mumbai', 'Maharashtra', 'Annie Besant Road, Worli', 4, 5, 5200, 'furnished', ['luxury', 'int3', 'int1', 'living'], ['parking', 'swimming-pool', 'gym', 'lift', 'security', 'air-conditioning', 'clubhouse', 'balcony'], true, 'approved'],
  ['Bright 2 BHK in Bandra West', 'rent', 'apartment', 'Apartments', 95000, 'Mumbai', 'Maharashtra', 'Pali Hill, Bandra West', 2, 2, 1100, 'furnished', ['apt1', 'living2', 'bedroom'], ['lift', 'security', 'air-conditioning', 'balcony', 'wifi'], true, 'approved'],
  ['Studio Apartment in Powai', 'rent', 'studio', 'Apartments', 32000, 'Mumbai', 'Maharashtra', 'Hiranandani Gardens, Powai', 1, 1, 480, 'furnished', ['apt3', 'kitchen'], ['lift', 'security', 'gym', 'wifi'], false, 'approved'],
  ['Gated Community 3 BHK in Gachibowli', 'sale', 'apartment', 'Apartments', 9800000, 'Hyderabad', 'Telangana', 'Financial District, Gachibowli', 3, 3, 1720, 'unfurnished', ['tower2', 'living', 'kitchen'], ['parking', 'swimming-pool', 'gym', 'lift', 'play-area', 'security'], true, 'approved'],
  ['Spacious Duplex in Jubilee Hills', 'sale', 'house', 'Independent Houses', 36000000, 'Hyderabad', 'Telangana', 'Road No. 36, Jubilee Hills', 5, 5, 4800, 'semi-furnished', ['house1', 'int2', 'living2', 'bedroom'], ['parking', 'garden', 'security', 'power-backup', 'modular-kitchen'], false, 'approved'],
  ['Furnished 2 BHK in Hitech City', 'rent', 'apartment', 'Apartments', 38000, 'Hyderabad', 'Telangana', 'Madhapur, Hitech City', 2, 2, 1200, 'furnished', ['apt2', 'living', 'bedroom'], ['parking', 'lift', 'gym', 'security', 'air-conditioning'], false, 'approved'],
  ['Hillside Bungalow in Koregaon Park', 'sale', 'house', 'Independent Houses', 27500000, 'Pune', 'Maharashtra', 'Lane 6, Koregaon Park', 4, 4, 3600, 'furnished', ['house4', 'int3', 'kitchen', 'bedroom'], ['parking', 'garden', 'security', 'fireplace', 'pet-friendly'], true, 'approved'],
  ['Modern 2 BHK in Baner', 'sale', 'apartment', 'Apartments', 8200000, 'Pune', 'Maharashtra', 'Baner-Balewadi Road', 2, 2, 1080, 'semi-furnished', ['tower1', 'living2', 'kitchen'], ['parking', 'lift', 'gym', 'play-area', 'power-backup'], false, 'approved'],
  ['Townhouse with Terrace in Kharadi', 'rent', 'townhouse', 'Independent Houses', 55000, 'Pune', 'Maharashtra', 'EON IT Park Road, Kharadi', 3, 3, 1900, 'semi-furnished', ['house2', 'living', 'bedroom'], ['parking', 'garden', 'security', 'balcony'], false, 'approved'],
  ['Heritage Villa near Candolim Beach', 'sale', 'villa', 'Villas', 52000000, 'Goa', 'Goa', 'Candolim, North Goa', 4, 4, 3900, 'furnished', ['villa1', 'int1', 'living2', 'bedroom'], ['swimming-pool', 'garden', 'parking', 'air-conditioning', 'pet-friendly'], true, 'approved'],
  ['Beach Apartment for Rent in Panaji', 'rent', 'apartment', 'Apartments', 45000, 'Goa', 'Goa', 'Dona Paula, Panaji', 2, 2, 1150, 'furnished', ['apt1', 'kitchen', 'bedroom'], ['swimming-pool', 'lift', 'security', 'balcony', 'wifi'], false, 'approved'],
  ['Premium Office Floor in Cyber City', 'rent', 'office', 'Commercial', 650000, 'Gurugram', 'Haryana', 'DLF Cyber City, Phase 2', 0, 4, 9500, 'furnished', ['office1', 'office2'], ['parking', 'lift', 'security', 'power-backup', 'air-conditioning', 'wifi'], true, 'approved'],
  ['4 BHK Golf Course Residence', 'sale', 'apartment', 'Luxury Homes', 68000000, 'Gurugram', 'Haryana', 'Golf Course Road, Sector 54', 4, 5, 4300, 'semi-furnished', ['tower2', 'int2', 'int3', 'bedroom'], ['parking', 'swimming-pool', 'gym', 'lift', 'clubhouse', 'security'], false, 'approved'],
  ['Builder Floor in South Delhi', 'sale', 'house', 'Independent Houses', 31000000, 'New Delhi', 'Delhi', 'Greater Kailash II', 3, 3, 2200, 'semi-furnished', ['house5', 'living', 'kitchen'], ['parking', 'security', 'power-backup', 'lift'], false, 'approved'],
  ['Retail Shop on High Street', 'sale', 'commercial', 'Commercial', 18500000, 'New Delhi', 'Delhi', 'Rajouri Garden Main Market', 0, 1, 850, 'unfurnished', ['office2'], ['security', 'power-backup'], false, 'approved'],
  ['Residential Plot in OMR', 'sale', 'plot', 'Plots & Land', 7500000, 'Chennai', 'Tamil Nadu', 'Old Mahabalipuram Road, Siruseri', 0, 0, 2400, 'unfurnished', ['land'], ['security'], false, 'approved'],
  ['Elegant 3 BHK in Adyar', 'rent', 'apartment', 'Apartments', 60000, 'Chennai', 'Tamil Nadu', 'Gandhi Nagar, Adyar', 3, 3, 1650, 'semi-furnished', ['apt3', 'living2', 'bedroom'], ['parking', 'lift', 'security', 'power-backup', 'balcony'], false, 'approved'],
  ['Garden Villa in ECR', 'sale', 'villa', 'Villas', 24000000, 'Chennai', 'Tamil Nadu', 'East Coast Road, Injambakkam', 3, 4, 3100, 'unfurnished', ['house6', 'int1', 'kitchen'], ['parking', 'garden', 'swimming-pool', 'security'], false, 'approved'],
  ['Compact 2 BHK near Metro', 'sale', 'apartment', 'Apartments', 6400000, 'Bengaluru', 'Karnataka', 'Yelachenahalli, Kanakapura Road', 2, 2, 1020, 'unfurnished', ['apt2', 'kitchen'], ['parking', 'lift', 'security'], false, 'pending'],
  ['Weekend Farmhouse Plot', 'sale', 'plot', 'Plots & Land', 4200000, 'Pune', 'Maharashtra', 'Mulshi Road', 0, 0, 10000, 'unfurnished', ['land'], [], false, 'pending'],
  ['Shared Office in Indiranagar', 'rent', 'office', 'Commercial', 85000, 'Bengaluru', 'Karnataka', '100 Feet Road, Indiranagar', 0, 2, 1400, 'furnished', ['office1'], ['wifi', 'air-conditioning', 'power-backup'], false, 'rejected'],
  ['Renovated Family Home (Draft)', 'sale', 'house', 'Independent Houses', 15500000, 'Hyderabad', 'Telangana', 'Kondapur', 3, 3, 2100, 'semi-furnished', ['house3'], ['parking', 'garden'], false, 'draft'],
];

const TESTIMONIALS = [
  { name: 'Ananya Rao', role: 'Bought a home in Bengaluru', content: 'EstateHub made our first home purchase feel simple. The filters were spot on and our agent replied within the hour.', rating: 5 },
  { name: 'Rahul Mehta', role: 'Rented in Mumbai', content: 'I shortlisted three flats in an evening and moved in two weeks later. Honest listings with real photos.', rating: 5 },
  { name: 'Priya & Karthik', role: 'Sold a villa in Goa', content: 'Our listing was approved quickly and we had serious buyers within days. The dashboard kept everything organised.', rating: 4 },
  { name: 'Vikram Singh', role: 'Leased office space', content: 'Finding a furnished office floor in Cyber City used to take months. We closed in three weeks.', rating: 5 },
];

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function clearAll() {
  await Promise.all(
    [User, Property, Category, Testimonial, Favorite, Inquiry, NewsletterSubscriber, ContactMessage, SiteSetting, Upload,
      RefreshToken, PasswordResetToken, EmailVerificationToken].map((m) => m.deleteMany({})),
  );
}

export async function seed() {
  await clearAll();
  await Promise.all([User, Property, Category, Favorite, NewsletterSubscriber, Upload].map((m) => m.syncIndexes()));

  const hash = (pw) => bcrypt.hash(pw, 10);
  const [adminHash, agentHash, userHash] = await Promise.all([hash('Admin@12345'), hash('Agent@12345'), hash('User@12345')]);

  const admin = await User.create({
    name: 'Site Admin', email: 'admin@estatehub.dev', passwordHash: adminHash, role: 'admin', isEmailVerified: true, phone: '+91 90000 00001', createdAt: daysAgo(170),
  });

  const agents = await User.insertMany([
    { name: 'Arjun Kapoor', email: 'arjun@estatehub.dev', city: 'Bengaluru', agency: 'Prime Nest Realty', designation: 'Senior Property Consultant', bio: 'Helping families find homes across Bengaluru for over 12 years. Specialist in North and East Bengaluru gated communities.', avatar: img(AVATARS[0], 400), phone: '+91 98450 11111', createdAt: daysAgo(160) },
    { name: 'Meera Iyer', email: 'meera@estatehub.dev', city: 'Mumbai', agency: 'Coastline Estates', designation: 'Luxury Homes Specialist', bio: 'Luxury residences and sea-facing apartments in South Mumbai and the western suburbs.', avatar: img(AVATARS[1], 400), phone: '+91 98200 22222', createdAt: daysAgo(150) },
    { name: 'Sameer Khan', email: 'sameer@estatehub.dev', city: 'Hyderabad', agency: 'Deccan Homes', designation: 'Residential Sales Lead', bio: 'Residential sales and rentals in Gachibowli, Jubilee Hills and Hitech City.', avatar: img(AVATARS[2], 400), phone: '+91 99890 33333', createdAt: daysAgo(120) },
    { name: 'Nisha Fernandes', email: 'nisha@estatehub.dev', city: 'Goa', agency: 'Sunset Properties', designation: 'Villa & Holiday Homes Expert', bio: 'Villas, holiday homes and investment properties in North and South Goa.', avatar: img(AVATARS[3], 400), phone: '+91 98220 44444', createdAt: daysAgo(90) },
  ].map((a) => ({ ...a, role: 'agent', passwordHash: agentHash, isEmailVerified: true })));

  const users = await User.insertMany([
    { name: 'Demo User', email: 'user@estatehub.dev', phone: '+91 90000 00002', createdAt: daysAgo(60) },
    { name: 'Rohan Das', email: 'rohan@estatehub.dev', createdAt: daysAgo(30) },
    { name: 'Kavya Nair', email: 'kavya@estatehub.dev', createdAt: daysAgo(10) },
  ].map((u) => ({ ...u, role: 'user', passwordHash: userHash, isEmailVerified: true })));

  const categories = await Category.insertMany(CATEGORIES.map((c) => ({ ...c, slug: slugify(c.name) })));
  const categoryByName = new Map(categories.map((c) => [c.name, c._id]));

  const agentByCity = {
    Bengaluru: agents[0], Mumbai: agents[1], Hyderabad: agents[2], Goa: agents[3], Pune: agents[0], Gurugram: agents[1], 'New Delhi': agents[1], Chennai: agents[2],
  };

  const properties = [];
  for (let i = 0; i < LISTINGS.length; i += 1) {
    const [title, listingType, propertyType, category, price, city, state, address, bedrooms, bathrooms, area, furnishing, photos, amenities, featured, status] = LISTINGS[i];
    const isUserListing = status !== 'approved' || i % 7 === 6;
    const owner = isUserListing ? users[i % users.length] : agentByCity[city];
    const createdAt = daysAgo(Math.max(1, 165 - i * 6));
    const _id = new mongoose.Types.ObjectId();

    // eslint-disable-next-line no-await-in-loop
    const uploads = await Upload.insertMany(
      photos.map((p) => ({ url: img(PHOTOS[p]), publicId: PHOTOS[p], provider: 'external', uploadedBy: owner._id, property: _id })),
    );

    properties.push({
      _id,
      title,
      slug: slugify(`${title} ${city}`),
      description: `${title} located at ${address}, ${city}. This ${bedrooms ? `${bedrooms}-bedroom ` : ''}${propertyType} offers ${area.toLocaleString('en-IN')} sq ft of thoughtfully planned space with ${furnishing.replace('-', ' ')} interiors, great natural light and easy access to schools, hospitals, shopping and public transport. Ideal for ${listingType === 'rent' ? 'tenants looking for a well-maintained home in a prime neighbourhood' : 'buyers looking for long-term value in a well-connected location'}.`,
      listingType,
      propertyType,
      category: categoryByName.get(category),
      price,
      currency: 'INR',
      address,
      city,
      state,
      country: 'India',
      postalCode: String(400001 + i * 1371).slice(0, 6),
      bedrooms,
      bathrooms,
      area,
      areaUnit: 'sqft',
      furnishing,
      amenities,
      parkingSpaces: amenities.includes('parking') ? 1 + (i % 2) : 0,
      yearBuilt: 2008 + (i % 16),
      images: uploads.map((u) => ({ upload: u._id, url: u.url, publicId: u.publicId, provider: 'external' })),
      owner: owner._id,
      agent: owner.role === 'agent' ? owner._id : undefined,
      status,
      rejectionReason: status === 'rejected' ? 'Photos do not match the listing description. Please upload actual photos of the space.' : '',
      featured,
      availabilityStatus: 'available',
      views: (i * 37) % 400,
      publishedAt: status === 'approved' ? createdAt : undefined,
      createdAt,
      updatedAt: createdAt,
    });
  }
  await Property.insertMany(properties);

  const approved = properties.filter((p) => p.status === 'approved');
  await Favorite.insertMany([0, 3, 6, 9].map((n) => ({ user: users[0]._id, property: approved[n]._id })));

  await Inquiry.insertMany([
    { property: approved[0]._id, sender: users[0]._id, recipient: approved[0].agent || approved[0].owner, name: 'Demo User', email: 'user@estatehub.dev', phone: '+91 90000 00002', message: 'Hi, is this apartment still available? I would like to schedule a visit this weekend.', status: 'new', createdAt: daysAgo(2) },
    { property: approved[3]._id, sender: users[1]._id, recipient: approved[3].agent || approved[3].owner, name: 'Rohan Das', email: 'rohan@estatehub.dev', message: 'Could you share the maintenance charges and parking details for this penthouse?', status: 'read', createdAt: daysAgo(5) },
    { property: approved[6]._id, sender: users[0]._id, recipient: approved[6].agent || approved[6].owner, name: 'Demo User', email: 'user@estatehub.dev', message: 'Is the price negotiable? I am pre-approved for a home loan.', status: 'replied', createdAt: daysAgo(12) },
    { property: approved[12]._id, name: 'Guest Buyer', email: 'guest@example.com', recipient: approved[12].agent || approved[12].owner, message: 'Interested in this villa as a holiday home. Please call me back.', status: 'new', createdAt: daysAgo(1) },
  ]);

  // The demo user owns some listings, so give them inquiries to manage as a recipient too.
  const userOwned = properties.find((p) => p.status === 'approved' && String(p.owner) === String(users[0]._id));
  if (userOwned) {
    await Inquiry.create({ property: userOwned._id, sender: users[2]._id, recipient: users[0]._id, name: 'Kavya Nair', email: 'kavya@estatehub.dev', message: 'Hello! I love this place. Is a site visit possible on Saturday morning?', status: 'new' });
  }

  await Testimonial.insertMany(TESTIMONIALS.map((t, i) => ({ ...t, avatar: '', isPublished: true, createdAt: daysAgo(40 - i * 5) })));
  await NewsletterSubscriber.insertMany(['subscriber1@example.com', 'subscriber2@example.com', 'subscriber3@example.com'].map((email) => ({ email })));
  await ContactMessage.create({ name: 'Neha Gupta', email: 'neha@example.com', subject: 'Partnership enquiry', message: 'We are a developer in Pune and would like to list a new project on EstateHub.' });
  await SiteSetting.getSingleton();

  return { admin: admin.email, agents: agents.length, users: users.length, properties: properties.length };
}

export async function seedIfEmpty() {
  const count = await User.estimatedDocumentCount();
  if (count > 0) return;
  console.log('[seed] Empty database detected, seeding demo data...');
  const summary = await seed();
  console.log('[seed] Done:', summary);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  (async () => {
    try {
      if (env.isProduction) throw new Error('Refusing to seed a production database');
      await connectDB();
      const summary = await seed();
      console.log('[seed] Database seeded:', summary);
      console.log('[seed] Logins: admin@estatehub.dev / Admin@12345, arjun@estatehub.dev / Agent@12345, user@estatehub.dev / User@12345');
    } catch (err) {
      console.error('[seed] Failed:', err.message);
      process.exitCode = 1;
    } finally {
      await disconnectDB();
    }
  })();
}
