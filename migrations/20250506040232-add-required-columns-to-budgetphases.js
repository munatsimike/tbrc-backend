'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add 'initial_budget' column
    await queryInterface.addColumn('BudgetPhases', 'initial_budget', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    });

    // Add 'budget' column
    await queryInterface.addColumn('BudgetPhases', 'budget', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    });

    // Ensure 'user_id' column exists
    const tableDescription = await queryInterface.describeTable('BudgetPhases');
    if (!tableDescription.user_id) {
      await queryInterface.addColumn('BudgetPhases', 'user_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('BudgetPhases', 'initial_budget');
    await queryInterface.removeColumn('BudgetPhases', 'budget');

    // Remove user_id only if it was added by this migration
    const tableDescription = await queryInterface.describeTable('BudgetPhases');
    if (tableDescription.user_id) {
      await queryInterface.removeColumn('BudgetPhases', 'user_id');
    }
  }
};
