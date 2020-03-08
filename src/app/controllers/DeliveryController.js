import * as Yup from 'yup';
import { Op } from 'sequelize';

import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Notification from '../schemas/Notification';

import DeliveryMail from '../jobs/DeliveryMail';
import Queue from '../../lib/Queue';

class DeliveryController {
  async index(req, res) {
    const { product, page = 1 } = req.query;

    const deliveries = await Delivery.findAll({
      where: {
        product: {
          [Op.iLike]: `%${product}%`,
        },
      },
      order: [['id', 'desc']],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: [
        'id',
        'product',
        'start_date',
        'end_date',
        'canceled_at',
        'status',
        'cancelable',
      ],
      include: [
        {
          model: Recipient,
          attributes: [
            'name',
            'street',
            'number',
            'complement',
            'city',
            'zip_code',
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['path', 'url'],
        },
      ],
    });
    return res.json(deliveries);
  }

  async show(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id, {
      where: {
        canceled_at: null,
      },
      attributes: [
        'id',
        'product',
        'status',
        'cancelable',
        'start_date',
        'end_date',
        'canceled_at',
      ],
      include: [
        {
          model: Recipient,
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'complement',
            'city',
            'state',
            'zip_code',
          ],
        },
        {
          model: Deliveryman,
          attributes: ['id', 'name', 'email'],
          include: [{ model: File, as: 'avatar', attributes: ['path', 'url'] }],
        },
        { model: File, as: 'signature', attributes: ['path', 'url'] },
      ],
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    return res.json(delivery);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id } = req.body;

    const recipient = await Recipient.findOne({
      where: { id: recipient_id },
    });

    if (!recipient) {
      res.status(401).json({ error: 'Recipient does not exists' });
    }

    const deliveryman = await Deliveryman.findOne({
      where: { id: deliveryman_id },
    });

    if (!deliveryman) {
      res.status(401).json({ error: 'Deliveryman does not exists' });
    }

    const delivery = await Delivery.create(req.body);

    /**
     * Notify delivery admin
     */

    const { street, number, complement, state, city, zip_code } = recipient;

    await Notification.create({
      content: 'New delivery',
      deliveryman: deliveryman_id,
      product: delivery.product,
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

    await Queue.add(DeliveryMail.key, {
      deliveryman,
      recipient,
      delivery,
    });

    return res.json(delivery);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string(),
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id } = req.body;
    const { id } = req.params;

    const deliveryExists = await Delivery.findByPk(id);

    if (!deliveryExists) {
      return res.status(400).json({ error: 'Delivery does not exist' });
    }

    const recipientExists = await Recipient.findOne({
      where: { id: recipient_id },
    });

    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient does not exist' });
    }

    const deliverymanExists = await Deliveryman.findOne({
      where: { id: deliveryman_id },
    });

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman does not exist' });
    }

    const { product } = await deliveryExists.update(req.body);

    return res.json({
      order: {
        id,
        product,
        recipient_id,
        deliveryman_id,
      },
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    if (!delivery.cancelable) {
      return res
        .status(400)
        .json({ error: 'Finalized delivery cannot deleted ' });
    }

    await Delivery.destroy({ where: { id } });

    return res.json({ message: 'Deleted successfull' });
  }
}

export default new DeliveryController();
