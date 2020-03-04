import * as Yup from 'yup';

import Deliveryman from '../models/Deliveryman';

class DeliverymanController {
  async index(req, res) {
    const deliverymen = await Deliveryman.findAll({
      order: ['id'],
      attributes: ['id', 'name', 'email'],
    });
    return res.json(deliverymen);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation is fail' });
    }

    const deliverymanExists = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman already exists' });
    }

    const { name, email } = await Deliveryman.create(req.body);
    return res.json({ name, email });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation is fail' });
    }

    const { email, name } = req.body;
    const { id } = req.params;

    const deliveryman = await Deliveryman.findOne({
      where: { id },
    });

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    if (email && email !== deliveryman.email) {
      const deliverymanExists = await Deliveryman.findOne({
        where: { email },
      });

      if (deliverymanExists) {
        return res.status(400).json({ error: 'Deliveryman already exists' });
      }

      await deliveryman.update(req.body);
    }
    return res.json({ id, name, email });
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findOne({
      where: { id },
    });

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    await Deliveryman.destroy({ where: { id } });

    return res.json();
  }
}

export default new DeliverymanController();
