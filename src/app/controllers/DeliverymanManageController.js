import { Op } from 'sequelize';
import * as Yup from 'yup';
import {
  setHours,
  parseISO,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
} from 'date-fns';

import Deliveryman from '../models/Deliveryman';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliverymanManageController {
  async index(req, res) {
    const { id } = req.params;
    const { product, page = 1 } = req.query;

    const deliverymanExists = await Deliveryman.findByPk(id);

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: id,
        canceled_at: null,
        end_date: {
          [Op.ne]: null,
        },
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
      ],
      include: [
        { model: Recipient, as: 'recipient', attributes: ['id', 'name'] },
        { model: File, as: 'signature', attributes: ['path', 'url'] },
      ],
    });

    return res.json(deliveries);
  }

  async update(req, res) {
    const { id, delivery_id } = req.params;
    const { start_date } = req.body;

    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const deliveryman = await Deliveryman.findOne({
      where: {
        id,
      },
    });

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const startHour = parseISO(start_date);

    if (
      isBefore(startHour, setHours(new Date(), 7)) ||
      isAfter(startHour, setHours(new Date(), 18))
    ) {
      return res.status(400).json({ error: 'Invalid time' });
    }

    const delivery = await Delivery.findOne({
      where: {
        id: delivery_id,
      },
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    if (delivery.start_date) {
      return res.status(400).json({ error: 'delivery already withdrawn' });
    }

    const deliveries = await Delivery.findAll({
      where: {
        start_date: {
          [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
        },
        deliveryman_id: id,
      },
    });

    if (deliveries.length >= 5) {
      return res
        .status(400)
        .json({ error: 'Maximum of 5 withdrawals per day' });
    }

    await delivery.update({
      start_date: parseISO(start_date),
    });

    return res.json({ msg: 'Delivery successfully withdrawn' });
  }
}

export default new DeliverymanManageController();
