'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('BudgetPhases', [
      {
        project_id: 1,
        phase: 'Phase 1: Planning',
        parent_id: null,
        isDeleted: false
      },
      {
        project_id: 2,
        phase: 'Phase 2: Design',
        parent_id: 1,
        isDeleted: false
      },
      {
        project_id: 3,
        phase: 'Phase 3: Construction',
        parent_id: null,
        isDeleted: false
      },
      {
        project_id: 1,
        phase: 'Initial Research',
        parent_id: null,
        isDeleted: false
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('BudgetPhases', null, {});
  }
};
