'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('BudgetPhases', [
      {
        project_id: 1,
        phase: 'Phase 1: Planning',
        parent_id: null,
        budget: 15000,
        initial_budget: 15000,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        project_id: 2,
        phase: 'Phase 2: Design',
        parent_id: 1,
        budget: 25000,
        initial_budget: 25000,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        project_id: 3,
        phase: 'Phase 3: Construction',
        parent_id: null,
        budget: 40000,
        initial_budget: 40000,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        project_id: 1,
        phase: 'Initial Research',
        parent_id: null,
        budget: 8000,
        initial_budget: 8000,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('BudgetPhases', null, {});
  }
};
