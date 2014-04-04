'use strict';

var Sequelize = require('sequelize'), 
    sequelize = new Sequelize('maxwallet', 'postgres', 'Compost12!', {
      dialect: "postgres", // or 'sqlite', 'postgres', 'mariadb'
      port:    5432, // or 5432 (for postgres)
    })
//Connects to postgres database
exports.sequelize
  .authenticate()
  .complete(function(err) {
    if (!!err) {
      console.log('Unable to connect to the database:', err)
    } else {
      console.log('Connection has been established successfully.')
    }
  })
//Defines Model for login
exports.User = sequelize.define('User', {
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true
    }
  },
  password: Sequelize.STRING
})
exports.AddressBookEntries = sequelize.define('AddressBookEntries', {
  name: Sequelize.STRING,
  address: Sequelize.STRING,
  notes: Sequelize.STRING
});
User.hasMany(AddressBookEntries);
//Adds some dummy data the table
sequelize.sync({ force: true }).complete(function(err) {
  User.create({ email: 'john@google.com', password: '1111' }).complete(function(err, user1) {
    User.find({where: { email: 'john'}}).complete(function(err, user2) {
    //Do some testing here?
    })
  })
User.create({ email: 'admin@google.com', password: '1234' }).complete(function(err, user1) {
  User.find({where: { email: 'admin@google.com'}}).complete(function(err, user2) {
  //Do some testing here?
  })
})
})