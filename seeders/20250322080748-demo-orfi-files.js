'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ORFIFiles', [
      {
        orfi_id: 1, // 🔥 Ensure ORFI with ID 1 exists
        fileName: 'rfq-steel.pdf',
        description: 'Request for quotation for steel materials',
        url: 'https://example.com/orfi-files/rfq-steel.pdf',
        isDeleted: false
      },
      {
        orfi_id: 1,
        fileName: 'delivery-schedule.xlsx',
        description: 'Proposed delivery schedule from supplier',
        url: 'https://example.com/orfi-files/delivery-schedule.xlsx',
        isDeleted: false
      },
      {
        orfi_id: 2,
        fileName: 'plumbing-drawings.zip',
        description: 'All plumbing plans for Phase 2',
        url: 'https://example.com/orfi-files/plumbing-drawings.zip',
        isDeleted: false
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ORFIFiles', null, {});
  }
};
