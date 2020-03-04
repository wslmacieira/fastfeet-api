import Sequelize, { Model } from 'sequelize';

class Deliveryman extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
      },
      {
        tableName: 'deliverymen',
        sequelize,
      }
    );
  }
}

export default Deliveryman;
