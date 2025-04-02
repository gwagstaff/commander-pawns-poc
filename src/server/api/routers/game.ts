import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const gameRouter = createTRPCRouter({
  listGames: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.game.findMany({
      include: {
        commanders: true,
        pawnsInGame: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  createGame: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        maxCommanders: z.number().min(2).max(4),
        maxPawns: z.number().min(4).max(1000),
        mapType: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.game.create({
        data: {
          name: input.name,
          maxCommanders: input.maxCommanders,
          maxPawns: input.maxPawns,
          mapType: input.mapType,
          commanders: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
        include: {
          commanders: true,
        },
      });
    }),

  joinAsCommander: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.game.update({
        where: { id: input.gameId },
        data: {
          commanders: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
        include: {
          commanders: true,
        },
      });
    }),

  joinAsPawn: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
        commanderId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.gamePawn.create({
        data: {
          gameId: input.gameId,
          userId: ctx.session.user.id,
          commanderId: input.commanderId,
        },
        include: {
          user: true,
          game: true,
        },
      });
    }),
}); 