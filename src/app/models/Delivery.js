import Sequelize, { Model } from 'sequelize';

class Delivery extends Model {
  static init(sequelize) {
    super.init(
      {
        product: Sequelize.STRING,
        canceled_at: Sequelize.DATE,
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            return this.status !== 'ENTREGUE' && this.status !== 'CANCELADO';
          },
        },
        status: {
          type: Sequelize.VIRTUAL,
          get() {
            let status;

            switch (status) {
              case this.canceled_at && status:
                status = 'CANCELADO';
                break;
              case this.end_date && status:
                status = 'ENTREGUE';
                break;
              case this.start_date && status:
                status = 'PENDENTE';
                break;
              default:
                status = 'RETIRAR';
            }
            return status;
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Recipient, {
      foreignKey: 'recipient_id',
      as: 'recipient',
    });
    this.belongsTo(models.Deliveryman, { foreignKey: 'deliveryman_id' });
    this.belongsTo(models.File, {
      foreignKey: 'signature_id',
      as: 'signature',
    });
  }
}

export default Delivery;
