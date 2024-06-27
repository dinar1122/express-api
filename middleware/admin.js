const { prisma } = require("../prisma/prisma-client");

const isAdmin = async (req, res, next) => {
    console.log('isAdmin')
    if (!req.user) {
        return res.status(401).json({ error: 'unauthorized' })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
        });

        if(!user){
            return res.status(404).json({ error: 'пользователь не найден'})
        }

        if (!user.isAdmin) {
            return res.status(403).json({ error: 'доступ запрещен' })
        }

        next()
    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ error: 'внутреняя ошибка сервера' })
    }
};

module.exports = { isAdmin };