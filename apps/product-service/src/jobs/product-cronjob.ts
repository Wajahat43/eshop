import prisma from '@packages/libs/prisma';

import cron from 'node-cron';

cron.schedule('0 * * * * ', async () => {
  try {
    await prisma.products.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lte: new Date(),
        },
      },
    });
    
  } catch (error) {
    console.error('Error deleting products:', error);
  }
});
