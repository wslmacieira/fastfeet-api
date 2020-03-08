import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    deliveryman: {
      type: String,
      required: true,
    },
    product: {
      type: String,
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    address: {
      type: Object,
      required: true,
    },
    description: {
      type: String,
      required: false,
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
