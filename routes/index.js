const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  UserController,
  PostController,
  CommentController,
  LikeController,
  SubsController,
  DislikeController,
  TopicSubsController
} = require("../controllers");
const { authToken } = require("../middleware/auth");

const uploadDestination = "uploads";

const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, callBack) {
    callBack(null, file.originalname);
  },
});

const uploads = multer({
  storage: storage,
});
/* user */
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/current", authToken, UserController.currentUser);
router.get("/users/:id", authToken, UserController.getUserById);
router.put("/users/:id", authToken, UserController.updateUser);

/* posts */

router.post("/posts", authToken, PostController.createPost);
router.delete("/posts/:id", authToken, PostController.removePostById);
router.get("/posts", authToken, PostController.getAllPosts);
router.get("/posts/:id", authToken, PostController.getPostById);

/* comments */

router.post("/comments", authToken, CommentController.createComment);
router.put("/comments", authToken, CommentController.updateComment);
router.delete("/comments", authToken, CommentController.removeComment);

/* Likes */

router.post("/likes/:id", authToken, LikeController.doLike);
router.delete("/likes/:id", authToken, LikeController.removeLike);
/* Dislikes */

router.post("/dislikes/:id", authToken, DislikeController.doDislike);
router.delete("/dislikes/:id", authToken, DislikeController.removeDislike);

/* Subscribtions */

router.post("/subs/:id", authToken, SubsController.subscribeUser);
router.delete("/subs/:id", authToken, SubsController.unsubscribeUser);

/* Topics subs */

router.post('/topic/:topicId', authToken, TopicSubsController.createSubcription)
router.get('/topic', authToken, TopicSubsController.getSubsByUserId)
router.delete('/topic/:topicId', authToken, TopicSubsController.removeSubcription)

module.exports = router;
