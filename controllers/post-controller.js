const { prisma } = require("../prisma/prisma-client");

const PostController = {
  createPost: async (req, res) => {
    const { content, topicId = "", categoryId, postTags } = req.body;
    console.log(topicId)
    const authorId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: "все поля должны быть заполнены" });
    }

    try {
      const post = await prisma.post.create({
        data: {
          content,
          authorId,
          topicId,
          categoryId,
        },
      });
      if(postTags) {
        const postTagData = postTags.map((tag) => ({
          postId: post.id,
          tagId: tag.id,
        }));

        await prisma.postTag.createMany({
          data: postTagData,
        });
      }

      
      const subscribedUsersOnTopic = await prisma.topicSubs.findMany({
        where: {
          topicId: topicId,
        },
      });

      if(subscribedUsersOnTopic.length > 0) {
        const notificationsData = subscribedUsersOnTopic.map((user) => ({
          userId: user.followerId,
          postId: post.id,
          objectType: "post",
        }));
  
        const createdNotifications = await prisma.notification.createMany({
          data: notificationsData,
        });
      }
      res.json(post);
    } catch (error) {
      console.log("create post error server" + error);
      res.status(500).json({ error: "server error"  });
    }
  },
  updatePostById: async (req, res) => {
    const { postId, content, topicId, categoryId, postTags = [] } = req.body;
    const authorId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: "все поля должны быть заполнены" });
    }

    try {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) {
        return res.status(404).json({ error: "запись не найдена" });
      }

      if (post.authorId !== authorId) {
        return res.status(403).json({ error: "Доступ запрещен" });
      }

      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          content,
          topicId: topicId,
          categoryId: categoryId,
        },
      });

      const existingTags = await prisma.postTag.findMany({
        where: {
          postId: postId,
        },
      });

      console.log(postTags);
      const existingTagsId = existingTags.map((tag) => tag.tagId);
      const newTagsId = postTags.map((tag) => tag.id);

      const tagsToAdd = newTagsId.filter(
        (tagId) => !existingTagsId.includes(tagId)
      );
      const tagsToRemove = existingTagsId.filter(
        (tagId) => !newTagsId.includes(tagId)
      );

      if (tagsToRemove.length > 0) {
        await prisma.postTag.deleteMany({
          where: {
            postId: postId,
            tagId: {
              in: tagsToRemove,
            },
          },
        });
      }
      if (tagsToAdd.length > 0) {
        const postTagDataNew = tagsToAdd.map((tagId) => ({
          postId: post.id,
          tagId: tagId,
        }));

        await prisma.postTag.createMany({
          data: postTagDataNew,
        });
      }

      return res.status(200).json(updatedPost);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "ошибка при обновлении поста" });
    }
  },

  getAllPosts: async (req, res) => {
    const userId = req.user.userId;

    const { limit = 4, page = 1 } = req.query;

    const pageLimit = parseInt(limit, 10);
    const pageOffset = (parseInt(page, 10) - 1) * pageLimit;

    try {
      const totalPosts = await prisma.post.count();

      const posts = await prisma.post.findMany({
        include: {
          postTags: { include: { tag: true } },
          author: true,
          comments: true,
          topic: true,
          category: true,
          _count: {
            select: {
              likes: true,
              dislikes: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: pageLimit,
        skip: pageOffset,
      });

      const userLikes = await prisma.like.findMany({
        where: {
          userId: userId,
          postId: { in: posts.map((post) => post.id) },
        },
        select: {
          postId: true,
        },
      });
      const userDislikes = await prisma.dislike.findMany({
        where: {
          userId: userId,
          postId: { in: posts.map((post) => post.id) },
        },
        select: {
          postId: true,
        },
      });

      const postWithLikeByUser = posts.map((post) => ({
        ...post,
        likedByUser: userLikes.some((like) => like.postId === post.id),
        dislikedByUser: userDislikes.some(
          (dislike) => dislike.postId === post.id
        ),
        rating: post._count.likes - post._count.dislikes,
      }));

      res.json({
        totalPosts,
        posts: postWithLikeByUser,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / pageLimit),
      });
    } catch (error) {
      console.log("ошибка при получении всех постов" + error);
      res.status(500).json({ error: "server error" });
    }
  },

  getPostById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const post = await prisma.post.findUnique({
        where: {
          id: id,
        },
        include: {
          category: true,
          postTags: { include: { tag: true } },
          comments: {
            include: {
              replyToComment: true,
              replies: { include: { user: true } },
              user: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          likes: true,
          dislikes: true,
          author: true,
          topic: true,
        },
      });
      if (!post) {
        return res.status(404).json({ error: "запись не найдена" });
      }
      const postWithLikeByUser = {
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
        dislikedByUser: post.dislikes.some(
          (dislike) => dislike.userId === userId
        ),
      };
      res.json(postWithLikeByUser);
    } catch (error) {
      console.log("ошибка при получении поста по айди" + error);
      res.status(500).json({ error: "server error" });
    }
  },
  removePostById: async (req, res) => {
    console.log(req.params);
    const { id } = req.params;
    const userId = req.user.userId;
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return res.status(404).json({ error: "Запись не найдена" });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ error: "Доступ запрещен" });
    }
    try {
      const transaction = await prisma.$transaction([
        prisma.comment.deleteMany({ where: { postId: id } }),
        prisma.like.deleteMany({ where: { postId: id } }),
        prisma.dislike.deleteMany({ where: { postId: id } }),
        prisma.notification.deleteMany({ where: { postId: id } }),
        prisma.postTag.deleteMany({ where: { postId: id } }),
        prisma.post.delete({ where: { id: id } }),
      ]);
      res.json(transaction);
    } catch (error) {
      console.log("ошибка при удалении поста по айди" + error);
      res.status(500).json({ error: "server error" });
    }
  },
  getPostByTopic: async (req, res) => {
    console.log(req.params);
    const { id } = req.params;
    const userId = req.user.userId;
    try {
      const posts = await prisma.post.findMany({
        where: {
          topicId: id,
        },
        include: {
          comments: {
            include: {
              user: true,
            },
          },
          likes: true,
          dislikes: true,
          author: true,
          topic: true,
        },
      });
      if (!posts) {
        return res.status(404).json({ error: "запись не найдена" });
      }
      const postsWithLikeByUser = posts.map((post) => {
        const likedByUser = post.likes.some((like) => like.userId === userId);
        const dislikedByUser = post.dislikes.some(
          (dislike) => dislike.userId === userId
        );

        return {
          ...post,
          likedByUser,
          dislikedByUser,
        };
      });
      res.json(postsWithLikeByUser);
    } catch (error) {
      console.log("ошибка при получении поста по теме" + error);
      res.status(500).json({ error: "server error" });
    }
  },
};

module.exports = PostController;
