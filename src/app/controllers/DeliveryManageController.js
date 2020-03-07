import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliveryManageController {
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
        end_date: null,
      },
      attributes: [
        'id',
        'product',
        'status',
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
      ],
    });
    return res.json(deliveries);
  }

  async show(req, res) {
    const { id, delivery_id } = req.params;

    const deliverymanExists = await Deliveryman.findByPk(id);

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const delivery = await Delivery.findOne({
      where: {
        deliveryman_id: id,
        id: delivery_id,
        canceled_at: null,
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
        {
          model: Recipient,
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'city',
            'state',
            'zip_code',
          ],
        },
        { model: File, as: 'signature', attributes: ['path', 'url'] },
      ],
    });

    if (!delivery) {
      return res.json({ error: 'Delivery does not exists' });
    }

    return res.json(delivery);
  }
}

export default new DeliveryManageController();
