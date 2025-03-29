'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('InvoiceFiles', [
      {
        invoice_id: 1, // 🔥 Ensure this BudgetInvoice exists
        fileName: 'invoice-jan.pdf',
        description: 'January invoice document',
        url: 'https://example.com/invoices/invoice-jan.pdf',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        invoice_id: 1,
        fileName: 'receipt-jan.pdf',
        description: 'Payment receipt for January',
        url: 'https://example.com/invoices/receipt-jan.pdf',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        invoice_id: 2,
        fileName: 'invoice-feb.pdf',
        description: 'February invoice document',
        url: 'https://example.com/invoices/invoice-feb.pdf',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('InvoiceFiles', null, {});
  }
};
