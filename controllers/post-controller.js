const { prisma } = require("../prisma/prisma-client");

const PostController = {
    createPost: async (req, res) => {
        const {content } = req.body

        const authorId = req.user.userId

        if (!content) {
            return res.status(400).json({error:'all fields must be filled'})
        }

        try {
            const post = await prisma.post.create({
                data: {
                    content,
                    authorId
                }
            })
            res.json(post)
        }
        catch(error) {
            console.log('create post error server')
            res.status(500).json({error: 'server error'})
        }
    },
    getAllPosts: async (req, res) => {
        const userId = req.user.userId

        try {
            const posts = await prisma.post.findMany({
                include: {
                    likes: true,
                    dislikes: true,
                    author: true,
                    comments: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
            const postWithLikeByUser = posts.map(item => ({
                ...item,
                likedByUser: item.likes.some(like => like.userId === userId),
                dislikedByUser: item.dislikes.some(dislike => dislike.userId === userId)
            }))
            res.json(postWithLikeByUser)
        } catch (error) {
            console.log('ошибка при получении всех постов' + error)
            res.status(500).json({error: 'server error'})
        }
    },
    getPostById: async (req, res) => {
        const {id } = req.params
        const userId = req.user.userId

        try {
            const post = await prisma.post.findUnique({
                where: {
                    id: id
                },
                include: {
                    comments: {
                        include: {
                            user: true
                        }
                    },
                    likes: true,
                    dislikes: true,
                    author: true,
                }
            })
            if (!post) {
                return res.status(404).json({error: 'запись не найдена'})
            }
            const postWithLikeByUser = {
                ...post,
                likedByUser: post.likes.some(like => like.userId === userId),
                dislikedByUser: post.dislikes.some(dislike => dislike.userId === userId)
            }
            res.json(postWithLikeByUser)
        } catch (error) {
            console.log('ошибка при получении поста по айди' + error)
            res.status(500).json({error: 'server error'})
        }

    },
    removePostById: async (req, res) => {
        console.log(req.params)
        const {id} = req.params
        const userId = req.user.userId
        const post = await prisma.post.findUnique({where: {id}})

        if (!post) {
            return res.status(404).json({error: 'Запись не найдена'})
        }

        if(post.authorId !== userId) {
            return res.status(403).json({error: 'Доступ запрещен'})
        }
        try {
            const transaction = await prisma.$transaction([
                prisma.comment.deleteMany({ where: { postId: id}}),
                prisma.like.deleteMany({ where: { postId: id}}),
                prisma.dislike.deleteMany({ where: { postId: id}}),
                prisma.post.delete({ where: { id: id}})
            ])
            res.json(transaction)
        } catch (error) {
            console.log('ошибка при удалении поста по айди' + error)
            res.status(500).json({error: 'server error'})
        }
    }
}

module.exports = PostController