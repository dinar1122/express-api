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
      });

      res.json(createdSub);
    } catch (error) {
        console.log(error)
      res.status(500).json({ error: "Ошибка при создании подписки на тему" });
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
            return res.status(403).json({ error: "вы уже не подписаны на эту тему" });
          }
          const removedSub = await prisma.topicSubs.delete({
            where: {
                id: existingSubs.id
            }
          })
          res.status(200).json(removedSub)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Ошибка при удалении подписки на тему" });
    }
  },
  getSubsByUserId: async (req, res) => {
    const { userId } = req.user;

    try {
        const userSubs = await prisma.user.findFirst({
            where: {
                id: userId
            },
            include: {
                topics: {
                    include: {
                        topic: true 
                    }
                }
            }
        })
        res.json(userSubs)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Ошибка при получении подписок на темы" });
    }
  },
};

module.exports = TopicSubsController;
