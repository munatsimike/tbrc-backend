'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ProjectUsers', [
      {
        project_id: 1,
        user_id: 1,
        role: 'Project Manager',
        assigned_at: new Date('2025-01-01')
      },
      {
        project_id: 1,
        user_id: 2,
        role: 'Engineer',
        assigned_at: new Date('2025-01-15')
      },
      {
        project_id: 2,
        user_id: 1,
        role: 'Consultant',
        assigned_at: new Date('2025-02-01')
      },
      {
        project_id: 3, 
        user_id: 1,
        role: 'Manager',
        assigned_at: new Date('2025-03-24')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ProjectUsers', null, {});
  }
};
