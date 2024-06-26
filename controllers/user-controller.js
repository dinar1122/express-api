const { prisma } = require("../prisma/prisma-client");
const bcrypt = require("bcryptjs");
const jdenticon = require("jdenticon");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { error } = require("console");

const UserController = {
  register: async (req, res) => {
    const { email, password, username } = req.body;
    if (!(email && password && username)) {
      return res.status(400).send("все поля обязательны для заполнения");
    }
    console.log(email);

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ error: "пользователь уже существует" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const png = jdenticon.toPng(username, 200);
      const avatarName = `${username}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, "/../uploads", avatarName);
      fs.writeFileSync(avatarPath, png);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          username,
          avatarUrl: `/uploads/${avatarName}`,
        },
      });
      res.status(200).send(user);
    } catch (error) {
      console.error(`ошибка при регистрации ${error}`);
      res.status(500).json({ error: "server error " + error });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).json({ error: "all fields must be filled" });
    }
    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(400).json({ error: "invalid login or password" });
      }
      const validPass = await bcrypt.compare(password, user.password);

      if (!validPass) {
        return res.status(400).json({ error: "invalid login or password" });
      }

      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);

      res.json({ token });
    } catch (error) {
      console.error("rerro login");
      res.status(500).json({ error: "server error" + error });
    }
  },
  getUserById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                comments: true,
                posts: {
                    include: {
                        postTags: { include: { tag: true } },
                        likes: true,
                        dislikes: true,
                        author: true,
                        comments: true,
                        topic: true,
                        category: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                followers: true,
                topics: {
                    include: {
                        topic: {
                            include: {
                                posts: {
                                    include: {
                                        author: true,
                                    },
                                    orderBy: {
                                        createdAt: "desc",
                                    },
                                },
                                _count: {
                                    select: {
                                        posts: true,
                                    },
                                },
                                topicSubs: true,
                            },
                        },
                    },
                },
                category: {
                    include: {
                        category: true,
                    },
                },
                notifications: true,
                following: {
                    include: {
                        following: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const userDataWithVotesAndRating = user.posts.map((item) => ({
            ...item,
            likedByUser: item.likes.some((like) => like.userId === userId),
            dislikedByUser: item.dislikes.some((dislike) => dislike.userId === userId),
            rating: item.likes.length - item.dislikes.length,
        }));

        const isFollowing = await prisma.follows.findFirst({
            where: {
                AND: [{ followerId: userId }, { followingId: id }],
            },
        });

        const topicsWithSubscription = await Promise.all(
            user.topics.map(async (userTopic) => {
                const { topic } = userTopic;
                const isSubscribed = topic.topicSubs.some((sub) => sub.followerId === userId);
                const isLiked = await prisma.like.findFirst({
                    where: {
                        topicId: topic.id,
                        userId: userId,
                    },
                });

                const rating = await prisma.like.findMany({
                    where: {
                        topicId: topic.id,
                    },
                });
                return {
                    ...userTopic,
                    topic: {
                        ...topic,
                        isSubscribed,
                        rating: rating.length,
                        isLiked: !!isLiked,
                    },
                };
            })
        );

        const userRating = userDataWithVotesAndRating.reduce((acc, post) => acc + post.rating, 0);

        const userWithSubscriptions = {
            ...user,
            posts: userDataWithVotesAndRating,
            topics: topicsWithSubscription,
            isFollowing: Boolean(isFollowing),
            rating: userRating,
        };

        res.json(userWithSubscriptions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error: " + error });
    }
}
,
  updateUser: async (req, res) => {
    const { id } = req.params;
    const { email, username, dateOfBirth, bio, location } = req.body;
    let filePath;

    if (req.file && req.file.path) {
      console.log(req.file);
      filePath = req.file.path.replace(/\\/g, "/");
    }

    if (id !== req.user.userId) {
      return res.status(403).json({ error: "no access" });
    }

    try {
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: email,
          },
        });
        console.log(existingUser);
        if (existingUser && existingUser.id !== id) {
          return res.status(400).json({ error: "mail already using" });
        }
      }
      const user = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined,
          username: username || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
          dateOfBirth: dateOfBirth || undefined,
          bio: bio || undefined,
          location: location || undefined,
        },
      });
      res.json(user);
    } catch (error) {
      console.log("update error", error);
      res.status(500);
    }
  },
  currentUser: async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.userId,
        },
        include: {
          likes: true,
          dislike: true,
          userTags: { include: { tag: true } },
          category: {
            include: {
              category: {
                include: {
                  _count: {
                    select: {
                      topics: true,
                      categorySubs: true,
                    },
                  },
                },
              },
            },
          },

          topics: {
            include: {
              topic: {
                include: {
                  category: true,
                  _count: { select: { posts: true, likes: true } },
                },
              },
            },
          },
          notifications: true,
          followers: {
            include: {
              follower: true,
            },
          },
          following: {
            include: {
              following: true,
            },
          },
        },
      });
      if (!user) {
        return res.status(400).json({ error: "пользователь не найден" });
      }
      const topicsIds = user.topics.map((el) => el.topicId);

      const ratings = await prisma.like.groupBy({
        by: ["topicId"],
        where: {
          topicId: { in: topicsIds },
        },
        _count: {
          topicId: true,
        },
      });

      const topicRatings = ratings.reduce((acc, rating) => {
        acc[rating.topicId] = rating._count.topicId;
        return acc;
      }, {});

      user.topics = user.topics.map((topic) => ({
        ...topic,
        rating: topicRatings[topic.topicId] || 0,
      }));

      return res.status(200).json(user);
    } catch (error) {
      console.log("err", error);
      res.status(500).json({ error: "Что-то пошло не так" });
    }
  },
  searchUsersByUsername: async (req, res) => {
    const { username } = req.params;
    console.log("name" + username);
    if (!username) {
      return res
        .status(400)
        .json({ error: "Параметр 'username' обязателен для поиска" });
    }

    try {
      const users = await prisma.user.findMany({
        where: {
          username: {
            contains: username,
            mode: "insensitive",
          },
        },
        include: {
          followers: {
            include: {
              follower: true,
            },
          },
          following: {
            include: {
              following: true,
            },
          },
        },
      });

      if (users.length === 0) {
        return res.status(404).json({ error: "Пользователи не найдены" });
      }

      return res.status(200).json(users);
    } catch (error) {
      console.log("err", error);
      res.status(500).json({ error: "Что-то пошло не так" });
    }
  },
};

module.exports = UserController;
