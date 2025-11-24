import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  lists: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const { getUserShoppingLists } = await import('./db');
      return getUserShoppingLists(ctx.user.id);
    }),
    
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const { getShoppingListById } = await import('./db');
      return getShoppingListById(input.id, ctx.user.id);
    }),
    
    create: protectedProcedure.input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { createShoppingList, getUserShoppingLists } = await import('./db');
      await createShoppingList({
        userId: ctx.user.id,
        name: input.name,
        description: input.description || null,
      });
      return getUserShoppingLists(ctx.user.id);
    }),
    
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { updateShoppingList, getUserShoppingLists } = await import('./db');
      const { id, ...data } = input;
      await updateShoppingList(id, ctx.user.id, data);
      return getUserShoppingLists(ctx.user.id);
    }),
    
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const { deleteShoppingList, getUserShoppingLists } = await import('./db');
      await deleteShoppingList(input.id, ctx.user.id);
      return getUserShoppingLists(ctx.user.id);
    }),
  }),
  
  items: router({
    getByListId: protectedProcedure.input(z.object({ listId: z.number() })).query(async ({ input }) => {
      const { getListItems } = await import('./db');
      return getListItems(input.listId);
    }),
    
    create: protectedProcedure.input(z.object({
      listId: z.number(),
      name: z.string().min(1).max(255),
      quantity: z.number().int().positive().default(1),
      unit: z.string().max(50).optional(),
      notes: z.string().optional(),
    })).mutation(async ({ input }) => {
      const { createShoppingItem, getListItems } = await import('./db');
      await createShoppingItem({
        listId: input.listId,
        name: input.name,
        quantity: input.quantity,
        unit: input.unit || null,
        notes: input.notes || null,
        isPurchased: 0,
      });
      return getListItems(input.listId);
    }),
    
    update: protectedProcedure.input(z.object({
      id: z.number(),
      listId: z.number(),
      name: z.string().min(1).max(255).optional(),
      quantity: z.number().int().positive().optional(),
      unit: z.string().max(50).optional(),
      notes: z.string().optional(),
      isPurchased: z.number().int().min(0).max(1).optional(),
    })).mutation(async ({ input }) => {
      const { updateShoppingItem, getListItems } = await import('./db');
      const { id, listId, ...data } = input;
      await updateShoppingItem(id, data);
      return getListItems(listId);
    }),
    
    delete: protectedProcedure.input(z.object({ id: z.number(), listId: z.number() })).mutation(async ({ input }) => {
      const { deleteShoppingItem, getListItems } = await import('./db');
      await deleteShoppingItem(input.id);
      return getListItems(input.listId);
    }),
  }),
  
  prices: router({
    getByItemId: protectedProcedure.input(z.object({ itemId: z.number() })).query(async ({ input }) => {
      const { getItemPrices } = await import('./db');
      return getItemPrices(input.itemId);
    }),
    
    add: protectedProcedure.input(z.object({
      itemId: z.number(),
      storeName: z.string().min(1).max(255),
      price: z.number().int().positive(),
      currency: z.string().length(3).default('USD'),
    })).mutation(async ({ input }) => {
      const { addItemPrice, getItemPrices } = await import('./db');
      await addItemPrice({
        itemId: input.itemId,
        storeName: input.storeName,
        price: input.price,
        currency: input.currency,
      });
      return getItemPrices(input.itemId);
    }),
  }),

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

  user: router({
    getProfile: protectedProcedure.query(({ ctx }) => {
      return ctx.user;
    }),

    updateLocation: protectedProcedure.input(z.object({
      location: z.string().min(1).max(255),
    })).mutation(async ({ ctx, input }) => {
      const { updateUserLocation } = await import('./db');
      await updateUserLocation(ctx.user.id, input.location);
      return { success: true, location: input.location };
    }),

    getStoresForUserLocation: protectedProcedure.query(async ({ ctx }) => {
      const { getStoresForLocation } = await import('./utils');
      if (!ctx.user.location) {
        return [];
      }
      const city = ctx.user.location.split(',')[0].trim();
      return getStoresForLocation('US', city);
    }),
  }),
});

export type AppRouter = typeof appRouter;
