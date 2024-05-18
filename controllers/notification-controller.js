const { prisma } = require("../prisma/prisma-client");

const NotificationController = {
  getNotificationsByUserId: async (req, res) => {
    const { userId } = req.user;

let notificationsByType = {};

try {
  const notifications = await prisma.notification.findMany({
    where: {
      userId: userId,
    },
    include: {
      post: {
        include: {
            topic: true
        }
      },
      topic: {
        include: {
            category: true
        }
      },
    },
  });

  if (notifications) {
    const notificationsMap = notifications.reduce((acc, notification) => {
      const { objectType } = notification;
      if (!acc[objectType]) {
        acc[objectType] = [];
      }
      acc[objectType].push(notification);
      return acc;
    }, {});

    notificationsByType = {...notificationsByType, ...notificationsMap};
  }

  res.json(notificationsByType);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ошибка при получении уведомлений" });
    }
  },
};

module.exports = NotificationController