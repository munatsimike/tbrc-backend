'use strict';

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ScheduleBudget', [
      {
        scheduleId: 1,         // Make sure this exists in your Schedule table
        budgetPhaseId: 1,      // Make sure this exists in your BudgetPhases table
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        scheduleId: 2,
        budgetPhaseId: 2,
        createdAt: new Date('2025-02-01'),
        updatedAt: new Date('2025-02-10')
      },
      {
        scheduleId: 3,
        budgetPhaseId: 3,
        createdAt: new Date('2025-03-01'),
        updatedAt: new Date('2025-03-15')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ScheduleBudget', null, {});
  }
};

