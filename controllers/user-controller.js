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
        where: {
          id,
        },
        include: {
          followers: true,
          following: true,
        },
      });
      if (!user) {
        return res.status(404).json({ error: "user is not found" });
      }
      const isFollowing = await prisma.follows.findFirst({
        where: {
          AND: [
            { followerId: userId },
            { followingId: id }
          ]
        }
      });
      res.json({...user, isFollowing: Boolean(isFollowing)})
    } catch (error) {
        res.status(500).json({error: ('server error' + error)})
    }
  },
  updateUser: async (req, res) => {
    const {id} = req.params
    const {email, username, dateOfBirth , bio, location} = req.body
    let filePath

    if (req.file && req.file.path) {
        filePath = req.file.path
    }

    if (id !== req.user.userId) {
        return res.status(403).json({error:'no access'})
    }

    try {
        if (email) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    email: email
                }
            })
            console.log(existingUser)
            if (existingUser && existingUser.id !== id) {
                return res.status(400).json({ error: 'mail already using'})
            }
        }
        const user = await prisma.user.update({
            where: {id},
            data: {
                email: email || undefined,
                username: username || undefined,
                avatarUrl: filePath ? `/${filePath}` : undefined,
                dateOfBirth: dateOfBirth || undefined,
                bio: bio || undefined,
                location: location || undefined,
              },
        })
        res.json(user)
    } catch (error) {
        console.log('update error', error)
        res.status(500)
    }
  },
  currentUser: async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId
            },
            include: {
                followers: {
                    include: {
                        follower: true
                    }
                },
                following: {
                    include: {
                        following: true
                    }
                }
            }
        })
        if (!user) {
            return res.status(400).json({ error: 'пользователь не найден'})
        }
        return res.status(200).json(user)
    } catch (error) {
        console.log('err', error)
      res.status(500).json({ error: "Что-то пошло не так" });
    }
  },
};

module.exports = UserController;
