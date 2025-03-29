'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('BudgetPhases', [
      {
        project_id: 1, // assumes a Project with ID 1 exists
        phase: 'Phase 1: Planning',
        parent_id: null,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        project_id: 2,
        phase: 'Phase 2: Design',
        parent_id: 1, // child of Phase 1
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        project_id: 3,
        phase: 'Phase 3: Construction',
        parent_id: null,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        project_id: 1, // another project (if exists)
        phase: 'Initial Research',
        parent_id: null,
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
