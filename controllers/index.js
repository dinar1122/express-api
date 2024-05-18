const UserController = require("./user-controller");
const PostController = require("./post-controller");
const CommentController = require("./comment-controller");
const LikeController = require("./like-controller");
const SubsController = require("./subs-controller");
const DislikeController = require('./dislike-controller');
const TopicSubsController = require('./topic-subs-controller');
const CategoryController = require("./category-controller");
const NotificationController = require("./notification-controller");

module.exports = {
  UserController,
  PostController,
  CommentController,
  LikeController,
  SubsController,
  DislikeController,
  TopicSubsController,
  CategoryController,
  NotificationController
};
