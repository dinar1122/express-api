const { prisma } = require("../prisma/prisma-client");

const TopicSubsController = {
  createSubcription: async (req, res) => {
    const { topicId } = req.params;
    const { userId } = req.user;
    const existingSubs = await prisma.topicSubs.findFirst({
      where: {
        AND: [{ followerId: userId }, { topicId: topicId }],
      },
    });
    if (existingSubs) {
      return res.status(403).json({ error: "вы уже подписаны на эту тему" });
    }
    try {
      const createdSub = await prisma.topicSubs.create({
        data: {
          topic: { connect: { id: topicId } },
          follower: { connect: { id: userId } },
        },
        include: {
          topic: {
            include: {
              category: true,
              _count: { select: { posts: true } },
            },
          },
        },
      });
      res.json(createdSub);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ошибка при создании подписки на тему" });
    }
  },
  createTopic: async (req, res) => {
    const { name, description, categoryId } = req.body;
    console.log(req.body)
    const { userId } = req.user;
    const existingTopic = await prisma.topic.findFirst({
      where: {
        name: name,

      },
    });
    if (existingTopic) {
      return res.status(403).json({ error: "тема не может быть создана" });
    }
    try {
      const createdTopic = await prisma.topic.create({
        data: {
          name: name,
          description: description,
          categoryId: categoryId,
          authorId: userId,
        },
      });
      res.json(createdTopic);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "тема не может быть создана, ошибка" });
    }
  },
  removeSubcription: async (req, res) => {
    const { topicId } = req.params;
    const { userId } = req.user;

    try {
      const existingSubs = await prisma.topicSubs.findFirst({
        where: {
          AND: [{ followerId: userId }, { topicId: topicId }],
        },
      });
      if (!existingSubs) {
        return res
          .status(403)
          .json({ error: "вы уже не подписаны на эту тему" });
      }
      const removedSub = await prisma.topicSubs.delete({
        where: {
          id: existingSubs.id,
        },
      });
      res.status(200).json(removedSub);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ошибка при удалении подписки на тему" });
    }
  },
  getSubsByUserId: async (req, res) => {
    const { userId } = req.user;

    try {
      const userSubs = await prisma.user.findFirst({
        where: {
          id: userId,
        },
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
        },
      });
      res.json(userSubs);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ошибка при получении подписок на темы" });
    }
  },
  getAllTopics: async (req, res) => {
    const { userId } = req.user;

    try {
      const topics = await prisma.topic.findMany({
        include: {
          topicSubs: true,
        },
      });
      const topicsWithSubscription = topics.map((topic) => ({
        ...topic,
        isSubscribed: topic.topicSubs.some((sub) => sub.followerId === userId),
      }));
      res.json(topicsWithSubscription);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ошибка при получении тем" });
    }
  },
  getTopicsByCategoryId: async (req, res) => {
    const { categoryId } = req.params;

    try {
      const topics = await prisma.topic.findMany({
        where: {
          categoryId: categoryId,
        },
        include: {
          topicSubs: true,
        },
      });

      res.json(topics);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ошибка при получении тем по категории" });
    }
  },
};

module.exports = TopicSubsController;
