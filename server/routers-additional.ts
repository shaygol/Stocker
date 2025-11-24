import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const additionalRouters = {
  paste: router({
    parseAndCreate: protectedProcedure.input(z.object({
      listName: z.string().min(1).max(255),
      pastedText: z.string().min(1),
      description: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { parseListText } = await import('./utils');
      const { createShoppingList, createShoppingItem, addToListHistory, getUserShoppingLists } = await import('./db');
      
      const items = parseListText(input.pastedText);
      
      await createShoppingList({
        userId: ctx.user.id,
        name: input.listName,
        description: input.description || null,
      });
      
      const lists = await getUserShoppingLists(ctx.user.id);
      const newList = lists[0];
      
      if (newList) {
        for (const itemName of items) {
          await createShoppingItem({
            listId: newList.id,
            name: itemName,
            quantity: 1,
            unit: null,
            notes: null,
            isPurchased: 0,
          });
        }
        
        await addToListHistory({
          userId: ctx.user.id,
          listId: newList.id,
          name: input.listName,
          itemCount: items.length,
        });
      }
      
      return getUserShoppingLists(ctx.user.id);
    }),
  }),

  history: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const { getUserListHistory } = await import('./db');
      return getUserListHistory(ctx.user.id);
    }),
  }),

  share: router({
    create: protectedProcedure.input(z.object({ listId: z.number() })).mutation(async ({ ctx, input }) => {
      const { generateShareToken } = await import('./utils');
      const { createSharedList } = await import('./db');
      
      const shareToken = generateShareToken();
      await createSharedList({
        listId: input.listId,
        shareToken,
        createdBy: ctx.user.id,
      });
      
      return { shareToken, shareUrl: `/shared/${shareToken}` };
    }),

    getByToken: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const { getSharedListByToken, getShoppingListById, getListItems } = await import('./db');
      
      const shared = await getSharedListByToken(input.token);
      if (!shared) return null;
      
      const list = await getShoppingListById(shared.listId, shared.createdBy);
      if (!list) return null;
      
      const items = await getListItems(shared.listId);
      
      return { list, items };
    }),
  }),

  stores: router({
    getForLocation: protectedProcedure.input(z.object({
      country: z.string().optional(),
      city: z.string().optional(),
    })).query(async ({ input }) => {
      const { getStoresForLocation } = await import('./utils');
      const country = input.country || 'US';
      return getStoresForLocation(country, input.city);
    }),
  }),
};
