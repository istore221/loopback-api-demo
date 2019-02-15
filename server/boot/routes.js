var axios = require('axios');



module.exports = function(app) {
  app.get('/upload', function(req, res) {
    // var User = app.models.user;
    // User.find((err,users)=>{
    //   res.send(users);
    // });

    axios.post('http://192.168.85.161:8998/batches', {
      "file": "/tmp/mobitel_ag.jar",
      "conf":{
        "spark.task.maxFailures":"8",
        "spark.yarn.maxAppAttempts":"4",
        "spark.yarn.am.attemptFailuresValidityInterval":"1h",
        "spark.yarn.max.executor.failures":"48",
        "spark.yarn.executor.failuresValidityInterval":"1h",
      } ,
      "className": "main.Main","numExecutors":3 ,
      "args": ["10" , "2018-01-01" , "00:00:00" , "720"],
      "jars": ["/tmp/spark-sql-kafka-0-10_2.11-2.2.0.jar"]})
      .then(function (response) {
        console.log(response.data.id);
        res.send(response);
      })
      .catch(function (error) {
        res.send(error);
      });



    });
  }
