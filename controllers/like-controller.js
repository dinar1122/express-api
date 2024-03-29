const { prisma } = require("../prisma/prisma-client");

const LikeController = {
  doLike: async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.userId;

    if (!postId) {
      return res.status(400).json({ error: "Заполните все поля" });
    }

    try {
      const existingLike = await prisma.like.findFirst({
        where: { postId, userId },
      });

      if (existingLike) {
        return res
          .status(400)
          .json({ error: "Вы не можете ставить лайк второй раз" });
      }

      const createdLike = await prisma.like.create({
        data: {
          postId: postId,
          userId: userId,
        },
      });
      res.status(200).json(createdLike);
    } catch (error) {
      console.log("ошибка при создании лайка" + error);
      res.status(500).json({ error: "ошибка при создании лайка (server)" });
    }
  },
  removeLike: async (req, res) => {
    const { id } = req.params;

    const userId = req.user.userId;

    if (!id) {
      return res.status(400).json({ error: "Заполните все поля" });
    }

    try {
      const existingLike = await prisma.like.findFirst({
        where: { postId: id, userId },
      });

      if (!existingLike) {
        return res
          .status(400)
          .json({
            error: "вы не можете убрать лайк по причине его отсутствия",
          });
      }

      const unlike = await prisma.like.deleteMany({
        where: { postId: id, userId: userId },
      });

      res.status(200).json(unlike);
    } catch (error) {
        console.log(error)
      res.status(500).json({ error: "При запросе произошла ошибка" });
    }
  },
};

module.exports = LikeController;
