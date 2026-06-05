import dbConnect from './src/lib/mongodb';
import Business from './src/models/Business';

async function run() {
  await dbConnect();
  const business = await Business.findOne({});
  console.log(business ? business._id.toString() : "No business found");
  process.exit(0);
}
run();
