'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Projects', [
      {
        name: 'Main Street',
        description: 'A small health facility being constructed in the village.',
        address: '123 Main Street, New York, NY 1001',
        isDeleted: false,
        thumbnailUrl: 'https://images.unsplash.com/photo-1516880711640-ef7db81be3e1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Elm Street',
        description: 'Upgrading classrooms and sanitation facilities.',
        address: 'Elm St, New York, Ny 10001',
        isDeleted: false,
        thumbnailUrl: 'https://images.unsplash.com/photo-1593012671976-1422185230fb?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Oak Street',
        description: 'Installing new wells and improving water infrastructure.',
        address: '89 Oak St, New York, Ny 10001',
        isDeleted: false,
        thumbnailUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdXNlJTIwdW5kZXIlMjBjb25zdHJ1Y3Rpb258ZW58MHx8MHx8fDA%3D',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Projects', null, {});
  }
};
