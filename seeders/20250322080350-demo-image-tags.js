'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ImageTags', [
      {
        imageId: 1, // 🔥 Make sure these IDs exist
        tagId: 1
      },
      {
        imageId: 1,
        tagId: 2
      },
      {
        imageId: 2,
        tagId: 1
      },
      {
        imageId: 3,
        tagId: 3
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ImageTags', null, {});
  }
};
