import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    deliveryman: {
      type: Number,
      required: true,
    },
    product: {
      type: String,
      required: true,
    },
    recipient: {
      type: Object,
      required: true,
    },
    address: {
      type: Object,
      required: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Notification', NotificationSchema);
