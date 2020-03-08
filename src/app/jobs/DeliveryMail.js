import Mail from '../../lib/Mail';

class DeliveryMail {
  get key() {
    return 'DeliveryMail';
  }

  async handle({ data }) {
    const { deliveryman, recipient, delivery } = data;
    const { name, street, number, complement, state, city } = recipient;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}`,
      subject: 'New delivery available',
      template: 'delivery',
      context: {
        deliveryman: deliveryman.name,
        recipient: name,
        address: `${street}, N° ${number} ${complement ||
          ''}, ${city} - ${state}`,
        product: delivery.product,
      },
    });
  }
}

export default new DeliveryMail();
