var express = require('express');
var router = express.Router();

/* GET jenkins/job to get job parameters */
router.get('/', function(req, res, next) {
  // params required
  // 1. job name
  var job_name = req.query.job_name || "Hello_Jenkins";

  var jenkins = req.app.get('jenkins');
  jenkins.job.get(job_name, function(err, data) {
    if (err) throw err;
    var index = -1;
    for(var i = 0; i < Object.keys(data.actions).length; i++) {
      if("_class" in data.actions[i] && data.actions[i]._class == "hudson.model.ParametersDefinitionProperty") {
        index = i;
        break;
      }
    }
    var params = index == -1 ? [] : data.actions[index].parameterDefinitions;
    res.json({'name': data.name, 'params': params});
  })
});

/* POST jenkins/job to trigger a build job */
router.post('/', function(req, res, next) {
  // params required
  // 1. job name
  // 2. job params
  var job_name = req.body.job_name || "Hello_Jenkins";
  var job_params = req.body.job_params || null;

  var jenkins = req.app.get('jenkins');
  jenkins.job.build({ name: job_name, parameters: job_params}, function(err, data) {
    if (err) throw err;

    res.json({'job': job_name, 'queue_item_number': data});
  })
});

module.exports = router;