import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    deliveryman: {
      type: String,
      required: false,
    },
    product: {
      type: String,
      required: false,
    },
    recipient: {
      type: String,
      required: false,
    },
    address: {
      type: Object,
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
