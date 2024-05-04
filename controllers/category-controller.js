const { prisma } = require("../prisma/prisma-client");

const CategoryController = {
    getAllCategories: async (req, res) => {
        const { userId } = req.user;
    
        try {
          
            const category = await prisma.category.findMany({
              include: {
                  topics: {
                    include: {
                        posts: true,
                        topicSubs: true
                    }
                  },
              },
          })
          const categoriesWithSubscription = await Promise.all(
            category.map(async (category) => {
                const isSubscribed = await prisma.categorySubs.findFirst({
                    where: {
                        AND: [
                            {
                                categoryId: category.id,
                            },
                            {
                                followerId: userId,
                            },
                        ],
                    },
                });
    
                const topics = await Promise.all(
                    category.topics.map(async (topic) => {
                        const isSubscribed = topic.topicSubs.some(sub => sub.followerId === userId);
                        return { ...topic, isSubscribed };
                    })
                );
    
                return { ...category, isSubscribed: !!isSubscribed, topics };
            })
        );
            res.json(categoriesWithSubscription)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Ошибка при получении категорий" + error});
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