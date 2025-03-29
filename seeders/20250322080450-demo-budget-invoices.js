'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('BudgetInvoices', [
      {
        budget_id: 1, // 🔥 Ensure this exists in BudgetPhases
        assignedTo: 1, // 🔥 Ensure this exists in Users
        date: new Date('2024-12-01'),
        amount: 25000.00,
        paid: 10000.00,
        isDeleted: false
      },
      {
        budget_id: 1,
        assignedTo: 2,
        date: new Date('2025-01-15'),
        amount: 18000.00,
        paid: 18000.00,
        isDeleted: false
      },
      {
        budget_id: 2,
        assignedTo: 1,
        date: new Date('2025-02-10'),
        amount: 30000.00,
        paid: 15000.00,
        isDeleted: false
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('BudgetInvoices', null, {});
  }
};
