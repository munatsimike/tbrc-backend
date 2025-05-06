'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('BudgetPhases', 'parent_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'BudgetPhases',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('BudgetPhases', 'parent_id');
  }
};