const { prisma } = require("../prisma/prisma-client");

const DislikeController = {
  doDislike: async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.userId;

    if (!postId) {
      return res.status(400).json({ error: "Заполните все поля" });
    }

    try {
      const existingDislike = await prisma.dislike.findFirst({
        where: { postId, userId },
      });

      if (existingDislike) {
        return res
          .status(400)
          .json({ error: "Вы не можете ставить Дизлайк второй раз" });
      }

      const createdDislike = await prisma.dislike.create({
        data: {
          postId: postId,
          userId: userId,
        },
      });
      res.status(200).json(createdDislike);
    } catch (error) {
      console.log("ошибка при создании Дизлайка" + error);
      res.status(500).json({ error: "ошибка при создании Дизлайка (server)" });
    }
  },
  removeDislike: async (req, res) => {
    const { id } = req.params;

    const userId = req.user.userId;

    if (!id) {
      return res.status(400).json({ error: "Заполните все поля" });
    }

    try {
      const existingDislike = await prisma.dislike.findFirst({
        where: { postId: id, userId },
      });

      if (!existingDislike) {
        return res
          .status(400)
          .json({
            error: "вы не можете убрать дизлайк по причине его отсутствия",
          });
      }

      const unDislike = await prisma.dislike.deleteMany({
        where: { postId: id, userId: userId },
      });

      res.status(200).json(unDislike);
    } catch (error) {
        console.log(error)
      res.status(500).json({ error: "При запросе произошла ошибка" });
    }
  },
};

module.exports = DislikeController;
