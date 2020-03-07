import { Op } from 'sequelize';
import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  startOfHour,
  parseISO,
} from 'date-fns';

import Deliveryman from '../models/Deliveryman';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import File from '../models/File';

import officeHour from '../../utils/officeHour';

class DeliverymanManageController {
  async index(req, res) {
    const { id } = req.params;

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
      },
      attributes: [
        'id',
        'product',
        'start_date',
        'end_date',
        'canceled_at',
        'status',
      ],
      include: [
        { model: Recipient, attributes: ['id', 'name'] },
        { model: File, as: 'signature', attributes: ['path', 'url'] },
      ],
    });

    return res.json(deliveries);
  }

  async update(req, res) {
    const { id, delivery_id } = req.params;

    const available = officeHour.map(time => {
      const [hour, minute] = time.split(':');
      const allowedTime = setSeconds(
        setMinutes(setHours(new Date(), hour), minute),
        0
      );

      return {
        allowedTime: format(allowedTime, "yyyy-MM-dd'T'HH:mm:ssxxx"),
      };
    });

    const start_date = {
      value: format(startOfHour(new Date()), "yyyy-MM-dd'T'HH:mm:ssxxx"),
    };

    const checkWithdrawal = available.find(a => a.value === start_date);

    // if (!checkWithdrawal) {
    //   return res
    //     .status(400)
    //     .json({ error: 'Out of hours withdrawal is not allowed' });
    // }

    const deliveryman = await Delivery.findOne({
      where: {
        deliveryman_id: id,
      },
    });

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists.' });
    }

    const delivery = await Delivery.findOne({
      where: {
        id: delivery_id,
      },
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists.' });
    }

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: id,
        start_date: {
          [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
        },
      },
    });

    if (!deliveries) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    if (deliveries.length >= 5) {
      return res
        .status(400)
        .json({ error: 'Maximum of 5 withdrawals per day' });
    }

    const deliveryRoute = await Delivery.findOne({
      where: {
        id: delivery_id,
        deliveryman_id: id,
        start_date: parseISO(start_date.value),
      },
    });

    if (deliveryRoute) {
      return res.status(400).json({ error: 'Delivery is already en route' });
    }

    await delivery.update({
      start_date: parseISO(start_date.value),
    });

    return res.json({ msg: 'Delivery successfully withdrawn' });
  }
}

export default new DeliverymanManageController();
