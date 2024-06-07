const { prisma } = require("../prisma/prisma-client");

const TagController = {
    getAllTags: async (req, res) => {
        try {
      
            const tags = await prisma.tag.findMany({
              
              include: {
                  postTags: true,
                  userTags: true,
              },
          })
          
            res.json(tags)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Ошибка при получении тегов" });
        }
      },
    
}

module.exports = TagController;