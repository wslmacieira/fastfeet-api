import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import Notification from '../schemas/Notification';

import Mail from '../../lib/Mail';

class DeliveryProblemController {
  async index(req, res) {
    return res.json({ ok: true });
  }

  async show(req, res) {
    return res.json({ ok: true });
  }

  async store(req, res) {
    const { id } = req.params;
    const { description } = req.body;

    const delivery = await Delivery.findOne({
      where: {
        id,
        canceled_at: null,
        end_date: null,
      },
      include: [
        { model: Deliveryman, as: 'deliveryman' },
        { model: Recipient, as: 'recipient' },
      ],
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    const problem = await DeliveryProblem.create({
      delivery_id: id,
      description,
    });

    const { deliveryman, recipient, product } = delivery.dataValues;
    const { street, number, complement, state, city, zip_code } = recipient;

    await Notification.create({
      content: 'Delivery problems',
      deliveryman: deliveryman.id,
      product,
      recipient: recipient.name,
      address: {
        street,
        number,
        complement,
        state,
        city,
        zip_code,
      },
    });

    return res.json(problem);
  }

  async delete(req, res) {
    const { id } = req.params;

    const problem = await DeliveryProblem.findByPk(id);

    if (!problem) {
      return res.status(400).json({ error: 'Problem does not exists' });
    }

    const delivery = await Delivery.findByPk(problem.delivery_id, {
      where: {
        id,
      },
      include: [
        { model: Recipient, as: 'recipient' },
        { model: Deliveryman, as: 'deliveryman' },
      ],
    });

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery does not exists' });
    }

    if (delivery.end_date) {
      return res.status(401).json({ error: 'Delivery already made' });
    }

    if (delivery.canceled_at) {
      return res.status(401).json({ error: 'Delivery already been canceled' });
    }

    delivery.canceled_at = new Date();

    const { deliveryman, recipient, product } = delivery.dataValues;
    const { street, number, complement, state, city, zip_code } = recipient;

    await Notification.create({
      content: 'Delivery canceled',
      deliveryman: deliveryman.id,
      product,
      recipient: recipient.name,
      address: {
        street,
        number,
        complement,
        state,
        city,
        zip_code,
      },
    });

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

    await delivery.save();

    return res.json({ msg: 'Canceled successful.' });
  }
}

export default new DeliveryProblemController();
