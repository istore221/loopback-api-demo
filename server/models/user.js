'use strict';

var async = require("async");


module.exports = function (User) {


    User.replaceOrCreateUserWithRoles = function (data,callback) {


      var user = new User(data);
      var roles = [];

      async.series({
        upsert: function (cb) {

            User.upsert(user,function(err, iuser) {
              if(err === null){
                user = iuser;
              }
              cb(err,user);
            });

        },
        roles: function (cb) {

              User.app.models.role.find({
                where: {
                  id: {inq:data.roles}
                }
              },function (err, groles) {
                if(err === null){
                  roles = groles;
                }
                cb(err,groles);
              });
        },
        removeRoleMappings: function (cb) {


            User.app.models.RoleMapping.destroyAll({
                principalId: user.id,
                principalType: User.app.models.RoleMapping.USER
            },function(err,roleMappings){
                cb(err,roleMappings);
            });


        },
        attachRoles: function (cb) {


           var attachRole = function (role, doneCallback) {

             role.principals.create({
                        principalType: User.app.models.RoleMapping.USER,
                        principalId: user.id
              }, function(err, principal) {
                  doneCallback(err,principal);
              })
          };


            async.map(roles,attachRole,function(err,results) {
                cb(err,results)
            })


        }
      }, function(err,results) {
          var response = user.toJSON();
          response['roles'] = roles;
          callback(err,response);
      });

    }

    // get user from token
    User.me = function (options,callback) {


      User.app.models.AccessToken.findById(options.accessToken.id ,{
          include: 'user'
      },function(err, accesstoken) {
        if (err) callback(err);

        if(!accesstoken){
          //no access token found
          var error = new Error(`Unknown Token ${token}`);
          error.status = 404;
          callback(error);
        }else{

          User.findById(accesstoken.user().id ,{
              include: 'roles'
          },function(err, user) {
            callback(err,user);
          })


        }




      });



    }


    // called when original remote login succeseed
    User.afterRemote('login', function( ctx, modelInstance, next) {

      let context = ctx.result.toJSON();

      User.findOne({
          where: {
            id: ctx.result.userId,
            locked: false
          },
          include: 'roles'
      },function(err, user) {

        if (err) return next(err);

        if(!user){
          var error = new Error(`login failed`);
          error.status = 401;
          return next(error);
        }else{
          ctx.result = {
           ...context,
           user
         };
         next();
        }



      });


    });

};
