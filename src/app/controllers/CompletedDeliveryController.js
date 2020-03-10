import * as Yup from 'yup';
import Delivery from '../models/Delivery';

class CompletedDeliveryController {
  async update(req, res) {
    const { id, delivery_id } = req.params;
    const { signature_id } = req.body;

    const schema = Yup.object().shape({
      signature_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const delivery = await Delivery.findOne({
      where: {
        id: delivery_id,
        deliveryman_id: id,
        canceled_at: null,
      },
      attributes: [
        'id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
        'status',
        'cancelable',
      ],
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    if (delivery.end_date) {
      return res.status(401).json({ error: 'Delivery already completed' });
    }

    await delivery.update({
      signature_id,
      end_date: new Date(),
    });

    return res.json(delivery);
  }
}

export default new CompletedDeliveryController();
