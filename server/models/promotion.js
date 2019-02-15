var http = require('http'),
    fs = require('fs'),
    WebHDFS  = require('webhdfs'),
    axios  = require('axios'),
    Json2csvParser = require('json2csv').Parser,
    str = require('string-to-stream');





module.exports = function(Promotion) {

  Promotion.retryPromotion = function (data,done) {


    // axios.post('http://192.168.85.161:8998/batches', {
    //   "file": "/tmp/mobitel_ag.jar",
    //   "conf":{
    //     "spark.task.maxFailures":"8",
    //     "spark.yarn.maxAppAttempts":"4",
    //     "spark.yarn.am.attemptFailuresValidityInterval":"1h",
    //     "spark.yarn.max.executor.failures":"48",
    //     "spark.yarn.executor.failuresValidityInterval":"1h",
    //   } ,
    //   "className": "main.Main","numExecutors":3 ,
    //   "args": [data.promotion_id , "2018-01-01" , "00:00:00" , "720"],
    //   "jars": ["/tmp/spark-sql-kafka-0-10_2.11-2.2.0.jar"]})
    //   .then(function (response) {
    //     const session = {session:response.data}
    //     Promotion.updateAll({id: data.promotion_id}, {data,...session}, function(err, info) {
    //       if(err) done(err);;
    //       done(null,promotion);
    //     });
    //
    //
    //
    //
    //
    //   })
    //   .catch(function (error) {
    //     done(error);
    //
    // });




  }



  Promotion.observe('before save', function(ctx, next) {


      var file = fs.createWriteStream("uploaded_file");
      var file_path = ctx.instance.customer_category_file.replace('https', 'http');
      var request = http.get(file_path, function(response) {
        response.pipe(file);
        var localFileStream = fs.createReadStream('./uploaded_file');


        let hdfs = WebHDFS.createClient({
            user: 'sheron',
            host: '192.168.85.162',
            port: 50070,
            path: `/webhdfs/v1/tmp/promo/${ctx.instance.promotion_id}`,
            overwrite: true
        });

        var remoteFileStream = hdfs.createWriteStream('/uploaded_file');
        var remoteFileStreamRules = hdfs.createWriteStream('/rules');
        localFileStream.pipe(remoteFileStream);

        // copy rule file
        const json2csvParser = new Json2csvParser({
            fields: ['segmentation', 'threshold', 'product', 'message'],
            header:false
        });
        const csv = json2csvParser.parse(ctx.instance.rules);
        str(csv.replace(/['"]+/g, '')).pipe(remoteFileStreamRules);




        // promo_id | startdate | starttime | duration




        if(ctx.instance.source){
            // start spark job

            axios.post('http://192.168.85.161:8998/batches', {
              "file": "/tmp/mobitel_ag.jar",
              "conf":{
                "spark.task.maxFailures":ctx.instance.sparkTaskMaxFailures || 8,
                "spark.yarn.maxAppAttempts":ctx.instance.sparkYarnMaxAppAttempts || 4,
                "spark.yarn.am.attemptFailuresValidityInterval":"1h",
                "spark.yarn.max.executor.failures":ctx.instance.sparkYarnMaxExecutorFailures || 4,
                "spark.yarn.executor.failuresValidityInterval":"1h",
              } ,
              "className": "main.Main","numExecutors":3 ,
              "args": [ctx.instance.promotion_id , "2018-01-01" , "00:00:00" , "720"],
              "jars": ["/tmp/spark-sql-kafka-0-10_2.11-2.2.0.jar"]})
              .then(function (response) {

                axios.post('http://192.168.85.161:8998/batches', {
                  "file": "/tmp/mobitel_ci.jar",
                  "conf":{
                    "spark.task.maxFailures":ctx.instance.sparkTaskMaxFailures || 8,
                    "spark.yarn.maxAppAttempts":ctx.instance.sparkYarnMaxAppAttempts || 4,
                    "spark.yarn.am.attemptFailuresValidityInterval":"1h",
                    "spark.yarn.max.executor.failures":ctx.instance.sparkYarnMaxExecutorFailures || 4,
                    "spark.yarn.executor.failuresValidityInterval":"1h",
                  } ,
                  "className": "main.Main","numExecutors":3 ,
                  "args": [ctx.instance.promotion_id],
                  "jars": ["/tmp/spark-sql-kafka-0-10_2.11-2.2.0.jar","/tmp/mysql-connector-java.jar"]})
                  .then(function (response2) {

                    ctx.instance.session = response.data;
                    ctx.instance.session2 = response2.data;
                    next();

                  }).catch(function (error) {
                    console.log(error);
                  });



              })
              .catch(function (error) {
                console.log(error);
            });


        }else{
            next();
        }




      });


  });







};
