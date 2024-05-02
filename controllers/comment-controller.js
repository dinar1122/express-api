const { prisma } = require("../prisma/prisma-client");

const CommentController = {
  createComment: async (req, res) => {
    const { postId, content } = req.body;
    const userId = req.user.userId;
    console.log(req.body);
    if (!(postId && content)) {
      return res.status(400).json({ error: "заполните все поля" });
    }

    try {
      const comment = await prisma.comment.create({
        data: {
          content: content,
          postId: postId,
          userId: userId,
        },
      });

      res.status(200).json(comment);
    } catch (error) {
      console.log("create comment error server");
      res.status(500).json({ error: "server error" });
    }
  },
  removeComment: async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;
    
    try {
      const comment = await prisma.comment.findUnique({ where: { id } });

      if (!comment) {
        return res.status(404).json({ error: "Комментарий не найден" });
      }

      if (comment.userId !== userId) {
        return res.status(403).json({ error: "Доступ запрещен" });
      }

      await prisma.comment.delete({ where: { id } });

      res.status(200).json(comment);
    } catch (error) {
      console.log("delete comment error server" + error);
      res.status(500).json({ error: "server error" });
    }
  },
  updateComment: async (req, res) => {
    const { id, content } = req.body;
    const { userId } = req.user;

    console.log(id);
    try {
      const comment = await prisma.comment.findUnique({ where: { id } });
      if (!comment) {
        return res.status(404).json({ error: "Комментарий не найден" });
      }

      if (comment.userId !== userId) {
        return res.status(403).json({ error: "Доступ запрещен" });
      }

      const changedComment = await prisma.comment.update({
        where: { id },
        data: {
          content,
        },
      });
      res.status(200).json(changedComment);
    } catch (error) {
      console.log("Ошибка при обновлении комментария" + error);
      res.status(500).json({ error: "Ошибка при обновлении комментария" });
    }
  },
};

module.exports = CommentController;
