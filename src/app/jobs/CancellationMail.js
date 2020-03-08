import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { deliveryman, recipient, product } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'canceled delivery',
      template: 'cancellation',
      context: {
        deliveryman: deliveryman.name,
        recipient: recipient.name,
        address: `${recipient.street}, N° ${recipient.number}
        ${recipient.complement || ''}, ${recipient.city} - ${recipient.state}`,
        product,
      },
    });
  }
}

export default new CancellationMail();
