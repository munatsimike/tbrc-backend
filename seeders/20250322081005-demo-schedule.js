'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Schedule', [
      {
        startdate: new Date('2025-01-01'),
        total_duration: 90, // days
        progress: 25.5, // percent complete
        isDeleted: false
      },
      {
        startdate: new Date('2025-02-15'),
        total_duration: 60,
        progress: 50,
        isDeleted: false
      },
      {
        startdate: new Date('2025-03-10'),
        total_duration: 120,
        progress: 10,
        isDeleted: false
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Schedule', null, {});
  }
};
