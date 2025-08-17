import prisma from '@packages/libs/prisma';

export const updateUserAnalytics = async (event: any) => {
  try {
    if (!event.userId) {
      return;
    }

    const exsistingData = await prisma.userAnalytics.findUnique({
      where: {
        userId: event.userId,
      },
      select: {
        actions: true,
      },
    });

    let updatedActions: any = exsistingData?.actions || [];

    const actionExsists = updatedActions.some(
      (entry: any) => entry.productId === event.productId && event.action === entry.action,
    );

    //Always store `product_view` for recommendations.
    if (event.action === 'product_view') {
      updatedActions.push({
        productId: event?.productId,
        shopId: event.shopId,
        action: event.action,
        timestamp: new Date(),
      });
    } else if (['add_to_wishlist', 'add_to_cart', 'remove_from_wishlist'].includes(event.action)) {
      if (!actionExsists) {
        updatedActions.push({
          productId: event?.productId,
          shopId: event.shopId,
          action: event?.action,
          timestamp: new Date(),
        });
      }
      //Remove `add_to_cart` if `remove_from_cart` is triggered.
    } else if (event.action === 'remove_from_cart') {
      updatedActions = updatedActions.filter(
        (action: any) => !(action.productId === event.productId && action.action === 'add_to_cart'),
      );
    } else if (event.action === 'remove_from_wishlist') {
      //Remove `add_to_wishlist` if `remove_from_wishlist` is triggered.
      updatedActions = updatedActions.filter(
        (action: any) => !(action.productId === event.productId && action.action === 'add_to_wishlist'),
      );
    }

    //Keep only 100 actions.
    if (updatedActions.length > 100) {
      updatedActions = updatedActions.slice(0, 100);
    }

    const extraFields: Record<string, any> = {};
    if (event.country) {
      extraFields.country = event.country;
    }

    if (event.city) {
      extraFields.city = event.city;
    }

    if (event.device) {
      extraFields.device = event.device;
    }

    //update or create user analytics
    await prisma.userAnalytics.upsert({
      where: { userId: event.userId },
      update: { lastVisited: new Date(), actions: updatedActions, ...extraFields },
      create: { userId: event.userId, lastVisited: new Date(), actions: updatedActions, ...extraFields },
    });
  } catch (error) {
    console.error(error);
  }
};

export const updateProductAnalytics = async (event: any) => {
  try {
    if (!event.productId) return;

    //Define update fields dynamically.
    const updateFields: any = {};

    if (event.action === 'product_view') updateFields.view = { increment: 1 };
    if (event.action === 'add_to_cart') updateFields.cartAdds = { increment: 1 };
    if (event.action === 'remove_from_cart') updateFields.cartAdds = { decrement: 1 };
    //Do the same for wishlist actions.
    if (event.action === 'add_to_wishlist') updateFields.wishlistAdds = { increment: 1 };
    if (event.action === 'remove_from_wishlist') updateFields.wishlistAdds = { decrement: 1 };
    //purchase
    if (event.action === 'purchase') updateFields.purchases = { increment: 1 };

    //Update product analytics.
    await prisma.productAnalytics.upsert({
      where: { productId: event.productId },
      update: { lastViewedAt: new Date(), ...updateFields },
      create: {
        productId: event.productId,
        shopId: event.shopId,
        views: event.action === 'product_view' ? 1 : 0,
        cartAdds: event.action === 'add_to_cart' ? 1 : 0,
        cartRemoves: event.action === 'remove_from_cart' ? 1 : 0,
        wishlistAdds: event.action === 'add_to_wishlist' ? 1 : 0,
        wishlistRemoves: event.action === 'remove_from_wishlist' ? 1 : 0,
        purchases: event.action === 'purchase' ? 1 : 0,
        lastViewedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(error);
  }
};
