import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let key = match[1];
      let val = match[2].replace(/^["'](.*)["']$/, '$1'); // remove quotes
      process.env[key] = val;
    }
  });
}

import mongoose from 'mongoose';
import Business from '../src/models/Business';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  try {
    const newBusiness = await Business.create({
      name: "Test Name",
      category: "Test Category",
      address: "Test Address",
      organizationId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      googlePlaceId: undefined, // Simulating a skip
      latitude: null,
      longitude: null,
    });
    console.log("Success:", newBusiness._id);
  } catch (err: any) {
    console.error("Mongoose Error:", err.message);
  }
  process.exit(0);
}

run();
