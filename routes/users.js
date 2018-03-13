var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  
  
  //res.send('respond with a resource');
  var theCookieValue  = req.cookies['cookie'];
  res.write("this is a write\n");
  
  res.write("theCookieValue: " + theCookieValue);
  


  res.write("\nthis is a write");
  res.end();

});

module.exports = router;
