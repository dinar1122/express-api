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
      follows: {
        include: {
            follower: true,
            following: true
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
  readNotifications: async (req, res) => {
    const { userId } = req.user;

    const updatedNotifications = await prisma.notification.updateMany({
        where: {
            userId: userId,
            isRead: false 
        },
        data: {
            isRead: true  
        }
    });
    
    if (updatedNotifications.count > 0) {
        res.status(200).json(`успешно прочитано ${updatedNotifications.count} уведомление для пользователя ${userId}.`);
    } else {
        res.status(404).json(`нет непрочитанных уведомлений для ${userId}.`);
    }
  }
};

module.exports = NotificationController