const { prisma } = require("../prisma/prisma-client");

const TagController = {
  getAllTags: async (req, res) => {
    try {
      const tags = await prisma.tag.findMany({
        include: {
          _count: {
            select: {
              postTags: true,
              userTags: true,
            },
          },
        },
      });

      res.json(tags);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ошибка при получении тегов" });
    }
  },
  createTag: async (req, res) => {
    const { nameTag } = req.params;
    try {
      const createdTag = await prisma.tag.create({
        data: {
          name: nameTag,
        },
      });

      res.json(createdTag);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ошибка при получении тегов" });
    }
  },
  getTagsByUserId: async (req, res) => {
    const { userId } = req.user;
    try {
      const tags = await prisma.userTag.findMany({
        where: {
          userId: userId,
        },
        include: {
          tag: true,
        },
      });

      res.json(tags);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "Ошибка при получении тегов пользователя" });
    }
  },
  createSubOnTag: async (req, res) => {
    const { tagId } = req.params;
    const { userId } = req.user;

    const existingTagSub = await prisma.userTag.findFirst({
      where: {
        userId: userId,
        tagId: tagId,
      },
    });
    if (existingTagSub) {
      return res.status(400).json({ error: "подписка на тег уже существует" });
    }
    try {
      const createdSub = await prisma.userTag.create({
        data: {
          userId: userId,
          tagId: tagId,
        },
      });

      res.json(createdSub);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ошибка при создании подписки на тег" });
    }
  },
  deleteSubOnTag: async (req, res) => {
    const { tagId } = req.params;
    const { userId } = req.user;

    const existingTagSub = await prisma.userTag.findFirst({
      where: {
        userId: userId,
        tagId: tagId,
      },
    });
    if (!existingTagSub) {
      return res
        .status(400)
        .json({ error: "подписка отсутствует и не может быть удалена" });
    }
    try {
      const deletedSub = await prisma.userTag.delete({
        where: {
          id: existingTagSub.id,
        },
      });

      res.json(deletedSub);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ошибка при удалении подписки на тег" });
    }
  },
};

module.exports = TagController;
