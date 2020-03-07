module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('users', 'provider', 'admin', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.renameColumn('users', 'provider', 'admin');
  },
};
