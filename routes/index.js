const express = require('express');
const router = express.Router();
const multer = require('multer');
const {UserController, PostController} = require('../controllers');
const {authToken} = require('../middleware/auth');

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
/* user */
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/current',authToken,UserController.currentUser);
router.get('/users/:id',authToken, UserController.getUserById);
router.put('/users/:id',authToken, UserController.updateUser);

/* posts */

router.post('/posts', authToken, PostController.createPost)
router.delete('/posts/:id', authToken, PostController.removePostById)
router.get('/posts',authToken, PostController.getAllPosts)
router.get('/posts/:id',authToken, PostController.getPostById)

module.exports = router;
