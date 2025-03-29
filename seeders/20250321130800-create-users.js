'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    const bcrypt = require('bcrypt'); // or import bcrypt from 'bcrypt'
    const hashedPassword1 = await bcrypt.hash('user123', 10);
    const hashedPassword2 = await bcrypt.hash('user123', 10);
    
    return queryInterface.bulkInsert('users', [
      {
        username: 'user2',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword1, // Make sure this is hashed
        phone_number: '1234567890',
        address: '123 Street, City',
        isSuperUser: false,
        isDeleted: false,
        isActivated: true,
        avatar: 'default.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'adminuser',
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword2,
        phone_number: '9876543210',
        address: '456 Avenue, City',
        isSuperUser: true,
        isDeleted: false,
        isActivated: true,
        avatar: 'admin.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};