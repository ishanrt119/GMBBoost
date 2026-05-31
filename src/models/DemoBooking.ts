import mongoose from 'mongoose';

const DemoBookingSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true },
  phone:        { type: String, required: true },
  company:      { type: String, required: true },
  businessType: { type: String, required: true },
  date:         { type: String, required: true },
  timeSlot:     { type: String, required: true },
  message:      { type: String, default: '' },
  status:       { type: String, default: 'PENDING', enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] },
}, { timestamps: true });

export default mongoose.models.DemoBooking ||
  mongoose.model('DemoBooking', DemoBookingSchema);