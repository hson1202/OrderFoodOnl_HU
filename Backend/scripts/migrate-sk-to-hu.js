/**
 * One-time MongoDB migration: drop legacy SK locale fields / codes; optional copy restaurant translations sk -> hu.
 * Run from Backend folder: node scripts/migrate-sk-to-hu.js
 * Requires MONGODB_URI (or MONGO_URI / DATABASE_URL) in .env
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
if (!uri) {
  console.error('Missing MONGODB_URI / MONGO_URI / DATABASE_URL');
  process.exit(1);
}

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const r1 = await db.collection('foods').updateMany({ nameSK: { $exists: true } }, { $unset: { nameSK: '' } });
  console.log('foods: unset nameSK count', r1.modifiedCount);

  const foodDocs = await db.collection('foods').find({ options: { $exists: true, $ne: [] } }).toArray();
  let foodOptionPatches = 0;
  for (const doc of foodDocs) {
    if (!Array.isArray(doc.options)) continue;
    let changed = false;
    const options = doc.options.map((opt) => {
      const o = { ...opt };
      if ('nameSK' in o) {
        delete o.nameSK;
        changed = true;
      }
      if (Array.isArray(o.choices)) {
        o.choices = o.choices.map((c) => {
          const ch = { ...c };
          if ('labelSK' in ch) {
            delete ch.labelSK;
            changed = true;
          }
          return ch;
        });
      }
      return o;
    });
    if (changed) {
      await db.collection('foods').updateOne({ _id: doc._id }, { $set: { options } });
      foodOptionPatches += 1;
    }
  }
  console.log('foods: documents with options patched', foodOptionPatches);

  const r2 = await db.collection('parentcategories').updateMany({ nameSK: { $exists: true } }, { $unset: { nameSK: '' } });
  console.log('parentcategories: unset nameSK', r2.modifiedCount);

  const r3 = await db.collection('categories').updateMany({ language: 'sk' }, { $set: { language: 'hu' } });
  console.log('categories: language sk -> hu', r3.modifiedCount);

  const r4 = await db.collection('parentcategories').updateMany({ language: 'sk' }, { $set: { language: 'hu' } });
  console.log('parentcategories: language sk -> hu', r4.modifiedCount);

  const r5 = await db.collection('blogs').updateMany({ titleSK: { $exists: true } }, { $unset: { titleSK: '' } });
  console.log('blogs: unset titleSK', r5.modifiedCount);

  const r6 = await db.collection('blogs').updateMany({ language: 'sk' }, { $set: { language: 'hu' } });
  console.log('blogs: language sk -> hu', r6.modifiedCount);

  const docs = await db.collection('restaurantinfos').find({}).toArray();
  for (const doc of docs) {
    const tr = doc.translations || {};
    if (tr.sk && !tr.hu) {
      await db.collection('restaurantinfos').updateOne(
        { _id: doc._id },
        { $set: { 'translations.hu': tr.sk }, $unset: { 'translations.sk': '' } }
      );
      console.log('restaurantinfos: copied translations.sk -> hu for', doc._id);
    } else if (tr.sk) {
      await db.collection('restaurantinfos').updateOne({ _id: doc._id }, { $unset: { 'translations.sk': '' } });
      console.log('restaurantinfos: removed translations.sk for', doc._id);
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
