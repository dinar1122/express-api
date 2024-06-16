const { prisma } = require("../prisma/prisma-client");

const CategoryController = {
  getAllCategories: async (req, res) => {
    const { userId } = req.user;
    try {
        const categories = await prisma.category.findMany({
            include: {
                topics: {
                    include: {
                        posts: {
                            include: {
                                author: true,
                                likes: true,
                            },
                        },
                        _count: {
                            select: {
                              posts: true,
                            },
                          },
                        topicSubs: true,
                        likes: true,
                    },
                },
                categorySubs: true,
            },
        });

        const categoriesWithSubscription = await Promise.all(
            categories.map(async (category) => {
                const isSubscribed = await prisma.categorySubs.findFirst({
                    where: {
                        AND: [
                            { categoryId: category.id },
                            { followerId: userId },
                        ],
                    },
                });

                const topics = await Promise.all(
                    category.topics.map(async (topic) => {
                        const isSubscribed = topic.topicSubs.some(
                            (sub) => sub.followerId === userId
                        );
                        const isLiked = await prisma.like.findFirst({
                          where: {
                              topicId: topic.id,
                              userId: userId
                          },
                      });
                      const rating = await prisma.like.findMany({
                        where: {
                            topicId: topic.id,
                        },
                    });
                        return { ...topic, isSubscribed, isLiked:!!isLiked, rating: rating.length };
                    })
                );

                return { ...category, isSubscribed: !!isSubscribed, topics };
            })
        );

        res.json(categoriesWithSubscription);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка при получении категорий: " + error });
    }
},
getCategoryById: async (req, res) => {
  const { categoryId } = req.params;
  const { userId } = req.user;

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

      const isSubscribed = !!(await prisma.categorySubs.findFirst({
          where: {
              categoryId: categoryId,
              followerId: userId,
          },
      }));
      const followers = (await prisma.categorySubs.findMany({
        where: {
            categoryId: categoryId,
        },
    }));
      const topicsWithSubscription = await Promise.all(
          category.topics.map(async (topic) => {
              const rating = await prisma.like.findMany({
                  where: {
                      topicId: topic.id,
                  },
              });

              const isSubscribed = topic.topicSubs.some(
                  (sub) => sub.followerId === userId
              );
              const isLiked = await prisma.like.findFirst({
                where: {
                    topicId: topic.id,
                    userId: userId
                },
            });
              return { ...topic, isSubscribed, rating: rating.length, isLiked: !!isLiked};
          })
      );

      const categoryWithSubscribeFields = {
          ...category,
          topics: topicsWithSubscription,
          isSubscribed,
          followers: followers.length
      };

      res.json(categoryWithSubscribeFields);
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ошибка при получении категории: " + error });
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
          return res.status(403).json({ error: "вы уже подписаны на эту категорию" });
        }
        try {
          const createdSub = await prisma.categorySubs.create({
            data: {
              category: { connect: { id: categoryId } },
              follower: { connect: { id: userId } },
            },
          });
    
          res.json(createdSub);
        } catch (error) {
            console.log(error)
          res.status(500).json({ error: "Ошибка при создании подписки на категорию" });
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
                return res.status(403).json({ error: "вы уже не подписаны на эту категорию" });
              }
              const removedSub = await prisma.categorySubs.delete({
                where: {
                    id: existingSubs.id
                }
              })
              res.status(200).json(removedSub)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Ошибка при удалении подписки на категорию" });
        }
      },
}

module.exports = CategoryController