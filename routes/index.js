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
  TopicController,
  CategoryController,
  NotificationController,
  TagController,
  ReportController
} = require("../controllers");
const { authToken } = require("../middleware/auth");
const { isAdmin } = require("../middleware/admin");


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
router.get("/users/search/:username", authToken, UserController.searchUsersByUsername);
router.put("/users/:id", authToken, uploads.single('file'), UserController.updateUser);

/* posts */

router.post("/posts", authToken, PostController.createPost);
router.put("/posts/:id", authToken, PostController.updatePostById);
router.delete("/posts/:id", authToken, PostController.removePostById);
router.get("/posts", authToken, PostController.getAllPosts);
router.get("/posts/search", authToken, PostController.getAllPosts);
router.get("/posts/:id", authToken, PostController.getPostById);
router.get("/posts/topic/:topicId", authToken, PostController.getAllPosts);

/* comments */

router.post("/comments", authToken, CommentController.createComment);
router.put("/comments", authToken, CommentController.updateComment);
router.delete("/comments/:id", authToken, CommentController.removeComment);

/* Likes */

router.post("/likes/:id", authToken, LikeController.doLike);
router.post("/likes/topic/:id", authToken, LikeController.doLikeOnTopic);
router.delete("/likes/:id", authToken, LikeController.removeLike);
/* Dislikes */

router.post("/dislikes/:id", authToken, DislikeController.doDislike);
router.delete("/dislikes/:id", authToken, DislikeController.removeDislike);

/* Subscribtions */

router.post("/follows/:id", authToken, SubsController.subscribeUser);
router.delete("/follows/:id", authToken, SubsController.unsubscribeUser);

/* Topic */

router.post('/topic/:topicId', authToken, TopicController.createSubcription)
router.post('/topic', authToken, TopicController.createTopic)
router.get('/topic', authToken, TopicController.getAllTopics)
router.get('/topic/category/:categoryId', authToken, TopicController.getTopicsByCategoryId)
router.delete('/topic/:topicId', authToken, TopicController.removeSubcription)

/* Category */
router.get('/category', authToken, CategoryController.getAllCategories)
router.get('/category/:categoryId', authToken, CategoryController.getCategoryById)
router.post('/category/:categoryId', authToken, CategoryController.createSubcription)
router.delete('/category/:categoryId', authToken, CategoryController.removeSubcription)

/* Notification */

router.get('/notifications', authToken, NotificationController.getNotificationsByUserId)
router.post('/notifications', authToken, NotificationController.readNotifications)

/* Tags  */

router.get('/tags', authToken, TagController.getAllTags)
router.get('/tags/user', authToken, TagController.getTagsByUserId)
router.post('/tags/:nameTag', authToken, TagController.createTag)
router.post('/tags/sub/:tagId', authToken, TagController.createSubOnTag)
router.delete('/tags/sub/:tagId', authToken, TagController.deleteSubOnTag)

/* Report */

router.get('/report', authToken, isAdmin, ReportController.getReportList)


module.exports = router;
