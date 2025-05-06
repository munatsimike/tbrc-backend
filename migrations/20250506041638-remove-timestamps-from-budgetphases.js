'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.removeColumn('BudgetPhases', 'createdAt'),
      queryInterface.removeColumn('BudgetPhases', 'updatedAt'),
    ]);
  },

  async down(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('BudgetPhases', 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }),
      queryInterface.addColumn('BudgetPhases', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }),
    ]);
  }
};
