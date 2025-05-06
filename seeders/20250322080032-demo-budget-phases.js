'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('BudgetPhases', [
      {
        project_id: 1,
        phase: 'Phase 1: Planning',
        parent_id: null,
        user_id: 1, // Make sure this user exists
        initial_budget: 50000,
        budget: 40000,
        isDeleted: false,
      },
      {
        project_id: 2,
        phase: 'Phase 2: Design',
        parent_id: 1,
        user_id: 2,
        initial_budget: 30000,
        budget: 25000,
        isDeleted: false,
      },
      {
        project_id: 3,
        phase: 'Phase 3: Construction',
        parent_id: null,
        user_id: 1,
        initial_budget: 100000,
        budget: 95000,
        isDeleted: false,
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('BudgetPhases', null, {});
  }
};
