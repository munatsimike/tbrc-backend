'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('BudgetPhases', 'initial_budget', {
      type: Sequelize.FLOAT,
      allowNull: true, // or false depending on your requirements
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('BudgetPhases', 'initial_budget');
  }
};

