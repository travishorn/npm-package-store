var express = require('express');
var router = express.Router();
var childProcess = require('child_process');
var request = require('request');

router.get('/', function(req, res) {
  childProcess.exec('npm ls -g --json', { maxBuffer: 1024 * 1024 }, function(err, stdout) {
    var dependencies = JSON.parse(stdout).dependencies;
    var totalModules = 0;
    var indexedModules = 0;
    var updates = [];
    var upToDate = [];

    function getRegistryInfo(module) {
      request(
        'http://registry.npmjs.org/' + module.name,
        function(err, r, registry) {
          registry = JSON.parse(registry);

          module.description = registry.description;
          module._id = registry._id;
          if (registry.author)
            module.author = registry.author.name;

          if (registry['dist-tags'] && module.installedVersion === registry['dist-tags'].latest) {
            upToDate.push(module);
          } else if (registry['dist-tags']) {
            updates.push(module);
          } else {
            console.warn('Skipped package ' + module.name + ' because it does not list a version!');
          }

          indexedModules += 1;

          if (indexedModules === totalModules) {
            res.render('installed', {
              updates: updates,
              upToDate: upToDate
            });
          }
        }
      );
    }

    for (var name in dependencies) {
      if (dependencies.hasOwnProperty(name)) {
        getRegistryInfo({
          name: name,
          installedVersion: dependencies[name].version
        });

        totalModules += 1;
      }
    }
  });
});

router.get('/update/:id', function(req, res) {
  childProcess.exec('npm update -g ' + req.params.id, function(err, stdout) {
    res.redirect('/');
  });
});

module.exports = router;
