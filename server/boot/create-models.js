'use strict';
var faker = require('faker');


module.exports = function(app) {

  var ds = app.dataSources.mongodb;
  var lbTables = ['user', 'AccessToken', 'ACL', 'RoleMapping', 'role','promotion','SelfAnalytics'];
  var User = app.models.user;
  var Role = app.models.role;
  var RoleMapping = app.models.RoleMapping;

  var _this = this;


  this.createUsers = function(numOfRows){
    var users = [];
    users.push({username: 'johnd', password: 'mypassword',firstName:'John',lastName:'Doe'})
    for (var i = 1; i <= numOfRows; i++) {
      users.push({username: faker.internet.userName(), password: 'mypassword',firstName:faker.name.firstName(),lastName:faker.name.lastName(),avatar:faker.image.avatar()})
    }
    return users;
  }



  ds.automigrate(lbTables, function(er) {
    if (er) throw er;
    console.log('Loopback tables [' + lbTables + '] created in ', ds.adapter.name);
    User.create(_this.createUsers(30), function(err, users) {
        if (err) throw err;

        //create the admin role
        Role.create([
          {name: 'Administrator'},
          {name: 'Business User'}

        ], function(err, roles) {
          if (err) throw err;

          //make john an admin
          roles[0].principals.create({
            principalType: RoleMapping.USER,
            principalId: users[0].id
          }, function(err, principal) {
            if (err) throw err;

          });




        });
      });
    ds.disconnect();
  });




};
