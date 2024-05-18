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
  TopicSubsController,
  CategoryController,
  NotificationController
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
router.get("/posts/topic/:id", authToken, PostController.getPostByTopic);

/* comments */

router.post("/comments", authToken, CommentController.createComment);
router.put("/comments", authToken, CommentController.updateComment);
router.delete("/comments/:id", authToken, CommentController.removeComment);

/* Likes */

router.post("/likes/:id", authToken, LikeController.doLike);
router.delete("/likes/:id", authToken, LikeController.removeLike);
/* Dislikes */

router.post("/dislikes/:id", authToken, DislikeController.doDislike);
router.delete("/dislikes/:id", authToken, DislikeController.removeDislike);

/* Subscribtions */

router.post("/follows/:id", authToken, SubsController.subscribeUser);
router.delete("/follows/:id", authToken, SubsController.unsubscribeUser);

/* Topics subs */

router.post('/topic/:topicId', authToken, TopicSubsController.createSubcription)
router.get('/topic', authToken, TopicSubsController.getAllTopics)
router.get('/topic/category/:categoryId', authToken, TopicSubsController.getTopicsByCategoryId)
router.delete('/topic/:topicId', authToken, TopicSubsController.removeSubcription)

/* Category */
router.get('/category', authToken, CategoryController.getAllCategories)
router.get('/category/:categoryId', authToken, CategoryController.getCategoryById)
router.post('/category/:categoryId', authToken, CategoryController.createSubcription)
router.delete('/category/:categoryId', authToken, CategoryController.removeSubcription)

/* Notification */

router.get('/notifications', authToken, NotificationController.getNotificationsByUserId)

module.exports = router;
