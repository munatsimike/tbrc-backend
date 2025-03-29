'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Images', [
      {
        projectId: 1, // 🔥 Make sure Project with ID 1 exists
        folderId: 1,  // 🔥 Make sure Folder with ID 1 exists (or set to null)
        imageName: 'foundation.jpg',
        imageUrl: 'https://example.com/images/foundation.jpg',
        description: 'Foundation work in progress.',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        projectId: 1,
        folderId: 1,
        imageName: 'blueprint.png',
        imageUrl: 'https://example.com/images/blueprint.png',
        description: 'Architectural blueprint of the building.',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        projectId: 2,
        folderId: null,
        imageName: 'overview.jpg',
        imageUrl: 'https://example.com/images/overview.jpg',
        description: 'Aerial view of the construction site.',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Images', null, {});
  }
};
