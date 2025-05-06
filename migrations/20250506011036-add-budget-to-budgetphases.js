'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('BudgetPhases', 'budget', {
      type: Sequelize.DECIMAL(10, 2), // or FLOAT/INTEGER depending on what you need
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('BudgetPhases', 'budget');
  }
};
