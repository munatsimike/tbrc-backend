'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ORFI', [
      {
        assignedTo: 1, // 🔥 Ensure user with ID 1 exists
        question: 'What is the expected delivery date for steel reinforcement?',
        dueDate: new Date('2025-04-01'),
        resolved: false,
        projectId: 1, // 🔥 Ensure project with ID 1 exists
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        assignedTo: 2,
        question: 'Can we get clarification on plumbing specifications for Phase 2?',
        dueDate: new Date('2025-04-05'),
        resolved: true,
        projectId: 1,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        assignedTo: null,
        question: 'Requesting clarification on roofing materials.',
        dueDate: new Date('2025-04-10'),
        resolved: false,
        projectId: 2,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ORFI', null, {});
  }
};
