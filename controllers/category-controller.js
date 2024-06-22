const { prisma } = require("../prisma/prisma-client");

const CategoryController = {
  getAllCategories: async (req, res) => {
    try {
      const categories = await prisma.category.findMany({
        include: {
            _count: {
                select: {
                  topics: true,
                  categorySubs: true,
                },
              },
          topics: {
            include: {
              category: true,
              _count: {
                select: {
                  posts: true,
                  likes: true,
                },
              },
              likes: true,
            },
          },
        },
      });

      res.json(categories);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Ошибка при получении категорий: " + error });
    }
  },
  getCategoryById: async (req, res) => {
    const { categoryId } = req.params;

    try {
      const category = await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
        select: {
          id: true,
          name: true,
          description: true,
          avatarUrl: true,
          topics: {
            include: {
              category: true,
              _count: { select: { posts: true, likes: true } },
              posts: {
                include: {
                  author: true,
                },
              },
              topicSubs: true,
            },
          },
        },
      });

      if (!category) {
        return res.status(404).json({ error: "Категория не найдена" });
      }

      res.json(category);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "Ошибка при получении категории: " + error });
    }
  },
  createSubcription: async (req, res) => {
    const { categoryId } = req.params;
    const { userId } = req.user;
    const existingSubs = await prisma.categorySubs.findFirst({
      where: {
        AND: [{ followerId: userId }, { categoryId: categoryId }],
      },
    });
    if (existingSubs) {
      return res
        .status(403)
        .json({ error: "вы уже подписаны на эту категорию" });
    }
    try {
      const createdSub = await prisma.categorySubs.create({
        data: {
          category: { connect: { id: categoryId } },
          follower: { connect: { id: userId } },
        },
        include: {category: true}
      });

      res.json(createdSub);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "Ошибка при создании подписки на категорию" });
    }
  },
  removeSubcription: async (req, res) => {
    const { categoryId } = req.params;
    const { userId } = req.user;

    try {
      const existingSubs = await prisma.categorySubs.findFirst({
        where: {
          AND: [{ followerId: userId }, { categoryId: categoryId }],
        },
      });
      if (!existingSubs) {
        return res
          .status(403)
          .json({ error: "вы уже не подписаны на эту категорию" });
      }
      const removedSub = await prisma.categorySubs.delete({
        where: {
          id: existingSubs.id,
        },
      });
      res.status(200).json(removedSub);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "Ошибка при удалении подписки на категорию" });
    }
  },
};

module.exports = CategoryController;
