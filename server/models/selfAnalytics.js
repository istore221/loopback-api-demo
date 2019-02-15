var axios  = require('axios');

'use strict';

module.exports = function(Selfa) {

  Selfa.observe('before save', function(ctx, next) {


    axios.post('http://192.168.85.161:8998/batches', {
      "file": "/tmp/spark_jobs/pyspark_custsegment_iter.py",
      "conf":{
        "spark.task.maxFailures":ctx.instance.sparkTaskMaxFailures || 8,
        "spark.yarn.maxAppAttempts":ctx.instance.sparkYarnMaxAppAttempts || 4,
        "spark.yarn.am.attemptFailuresValidityInterval":"1h",
        "spark.yarn.max.executor.failures":ctx.instance.sparkYarnMaxExecutorFailures || 4,
        "spark.yarn.executor.failuresValidityInterval":"1h",
      } ,
      "numExecutors":3 ,
      "args": ['--runs',ctx.instance.runs,"--runId",ctx.instance.runsid]
      })
      .then(function (response) {

        ctx.instance.session = response.data;
        next();

      })
      .catch(function (error) {
        console.log(error);
      })




  })


}
