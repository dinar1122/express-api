const express = require('express');
const router = express.Router();
const multer = require('multer')

const uploadDestination = 'uploads'

const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function(req, file, callBack) {
    callBack(null,file.originalname)
  }
})

const uploads = multer({
  storage: storage
})
/* GET home page. */
router.get('/register', function(req, res) {
  res.send('register');
});

module.exports = router;
