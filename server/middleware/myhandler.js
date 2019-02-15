
//check for locked users
module.exports = function(app) {
  return function customHandler(req, res, next) {

    var User = req.app.models.user;

    if(req.accessToken){

      var userId = req.accessToken.userId;

      User.findOne({
        where: {
          id: userId,
          locked: false
        }
      },function(err, user) {
        if(err) next(err);

        if(user) next();

        if(!user){
          var error = new Error(`login failed`);
          error.status = 401;
          next(error);

        }

      });


    }else{
      next();
    }

  }
};
