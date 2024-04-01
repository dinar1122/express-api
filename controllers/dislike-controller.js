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

    },
}

module.exports = DislikeController