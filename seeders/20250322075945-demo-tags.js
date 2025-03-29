'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Tags', [
      {
        tagName: 'Urgent',
        isDeleted: false
      },
      {
        tagName: 'Completed',
        isDeleted: false
      },
      {
        tagName: 'In Progress',
        isDeleted: false
      },
      {
        tagName: 'Planning',
        isDeleted: false
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tags', null, {});
  }
};

