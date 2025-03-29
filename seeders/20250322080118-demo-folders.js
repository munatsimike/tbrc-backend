'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Folders', [
      {
        name: 'Architectural Designs',
        description: 'Contains all the design blueprints and renders.',
        projectId: 1, // 🔥 Make sure project with ID 1 exists
        isDeleted: false
      },
      {
        name: 'Financial Reports',
        description: 'Quarterly budget and expense reports.',
        projectId: 1,
        isDeleted: false
      },
      {
        name: 'Site Photos',
        description: 'Images taken from construction site inspections.',
        projectId: 2, // 🔥 Ensure project with ID 2 exists
        isDeleted: false
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Folders', null, {});
  }
};
