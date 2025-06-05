'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log("Seeding starting...");
      const bcrypt = require('bcrypt');
      const hashedPassword1 = await bcrypt.hash('user123', 10);
      const hashedPassword2 = await bcrypt.hash('user123', 10);

      await queryInterface.bulkInsert('Users', [
        {
          username: 'RobertG',
          name: 'Robert Green',
          email: 'robert.green@theestate.com',
          password: hashedPassword1,
          phone_number: '+316500222022',
          address: '123 Street, City',
          isSuperUser: true,
          isDeleted: false,
          isActivated: true,
          avatar: 'https://randomuser.me/api/portraits/men/91.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: 'JuliaR',
          name: 'Julia Roberts',
          email: 'julia.roberts@theestate.com',
          password: hashedPassword2,
          phone_number: '+9876543210',
          address: '456 Avenue, City',
          isSuperUser: true,
          isDeleted: false,
          isActivated: true,
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]);

      console.log("Seeding complete");

    } catch (error) {
      console.error("Seeder failed with error:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
