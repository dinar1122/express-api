const { prisma } = require("../prisma/prisma-client");

const SubsController = {
  subscribeUser: async (req, res) => {
    const followingId = req.params.id;
    const userId = req.user.userId;

    if (followingId === userId) {
      return res
        .status(400)
        .json({ error: "подписка на самого себя невозможна" });
    }

    try {
      const existingSubs = await prisma.follows.findFirst({
        where: {
          AND: [
            {
              followingId: followingId,
            },
            {
              followerId: userId,
            },
          ],
        },
      });
      if (existingSubs) {
        return res.status(400).json({ error: "вы уже подписаны" });
      }

      const createdSubs = await prisma.follows.create({
        data: {
          follower: { connect: { id: userId } },
          following: { connect: { id: followingId } },
        },
      });
      
      const createNotification = await prisma.notification.create({
        data: {
          userId: followingId,
          followsId: createdSubs.id,
          objectType: 'follows'
        }
      });

      res.status(200).json(createdSubs);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "ошибка при создании подписки" });
    }
  },
  unsubscribeUser: async (req, res) => {
    const followingId = req.params.id;
    const userId = req.user.userId;

    try {
      const existingSubs = await prisma.follows.findFirst({
        where: {
          AND: [
            {
              followingId: followingId,
            },
            {
              followerId: userId,
            },
          ],
        },
      });
      if (!existingSubs) {
        return res.status(400).json({ error: "вы не подписаны" });
      }
      const removedSubs = await prisma.follows.delete({
        where: {
          id: existingSubs.id,
        },
      });
      
      res.status(200).json(removedSubs);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "ошибка при удалении подписки" });
    }
  },
};
module.exports = SubsController;
