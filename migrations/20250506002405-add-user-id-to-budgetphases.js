'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('BudgetPhases', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // or false if required
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('BudgetPhases', 'user_id');
  }
};
