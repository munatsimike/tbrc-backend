'use strict';

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ScheduleBudget', [
      {
        scheduleId: 1,         // Make sure this exists in your Schedule table
        budgetPhaseId: 1      // Make sure this exists in your BudgetPhases table
      
      },
      {
        scheduleId: 2,
        budgetPhaseId: 2
        
      },
      {
        scheduleId: 3,
        budgetPhaseId: 3
        
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ScheduleBudget', null, {});
  }
};

