const { prisma } = require("../prisma/prisma-client");

const ReportController = {
  getReportList: async (req, res) => {

    try {
      const reports = await prisma.report.findMany({
        include: {
          reportedBy: true, 
          post: {include: {
            author: true
          }},
        },
      });

      res.status(200).json(reports);
    } catch (error) {
      console.error("ошибка при получении списка репортов", error);
      res.status(500).json({ error: "внутренная ошибка сервера" });
    }
  },
};

module.exports = ReportController;