import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import {
  zAchievement,
  zFormFieldsAchievement,
} from '@/features/achievement/schema';
import { fetchGithubStarred } from '@/features/github/utils';
import { Prisma } from '@/server/db/generated/client';
import { protectedProcedure } from '@/server/orpc';

const tags = ['achievements'];

export default {
  getAll: protectedProcedure({
    permission: {
      achievement: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/achievements',
      tags,
    })
    .input(
      z
        .object({
          cursor: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(100).prefault(20),
          searchTerm: z.string().trim().optional().prefault(''),
        })
        .prefault({})
    )
    .output(
      z.object({
        items: z.array(zAchievement()),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      context.logger.info('Getting achievements from database');

      const where = {
        OR: [
          {
            name: {
              contains: input.searchTerm,
              mode: 'insensitive',
            },
          },
          {
            hint: {
              contains: input.searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      } satisfies Prisma.AchievementWhereInput;

      const [total, items] = await Promise.all([
        context.db.achievement.count({
          where,
        }),
        context.db.achievement.findMany({
          // Get an extra item at the end which we'll use as next cursor
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: {
            name: 'asc',
          },
          where,
        }),
      ]);

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
        total,
      };
    }),

  getAllWithCompletion: protectedProcedure({
    permission: {
      apps: ['app'],
    },
  })
    .route({
      method: 'GET',
      path: '/achievements/with-completion',
      tags,
    })
    .input(
      z
        .object({
          cursor: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(100).prefault(100),
        })
        .prefault({})
    )
    .output(
      z.object({
        items: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            hint: z.string().nullish(),
            points: z.number().int(),
            emoji: z.string().nullish(),
            imageUrl: z.string().nullish(),
            createdAt: z.date(),
            updatedAt: z.date(),
            completed: z.boolean(),
            isSecret: z.boolean(),
          })
        ),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      context.logger.info('Getting achievements with completion state');

      const [total, items] = await Promise.all([
        context.db.achievement.count(),
        context.db.achievement.findMany({
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { points: 'desc' },
          include: {
            unlockedAchievements: {
              where: { userId: context.user.id },
              select: { achievementId: true },
            },
          },
        }),
      ]);

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      const mapped = items
        .map((achievement) => {
          const completed = achievement.unlockedAchievements.length > 0;

          return {
            id: achievement.id,
            name: achievement.isSecret && !completed ? '???' : achievement.name,
            hint: achievement.hint ?? null,
            points: achievement.isSecret && !completed ? 0 : achievement.points,
            emoji: achievement.emoji ?? null,
            imageUrl: achievement.imageUrl ?? null,
            createdAt: achievement.createdAt,
            updatedAt: achievement.updatedAt,
            completed,
            isSecret: achievement.isSecret,
          };
        })
        .sort((a, b) => {
          if (a.completed && !b.completed) return 1;
          if (!a.completed && b.completed) return -1;

          return b.points - a.points;
        });

      return {
        items: mapped,
        nextCursor,
        total,
      };
    }),

  getGithubAchievementsToClaim: protectedProcedure({
    permission: null,
  })
    .route({
      method: 'GET',
      path: '/account/github-stars',
      tags,
    })
    .input(z.void())
    .output(
      z
        .array(
          z.object({
            achievement: zAchievement().extend({ secretId: z.string() }),
            repository: z.string(),
          })
        )
        .nullable()
    )
    .handler(async ({ context }) => {
      const githubAccount = await context.db.account.findFirst({
        where: {
          userId: context.user.id,
          providerId: 'github',
        },
      });

      if (!githubAccount?.accessToken) {
        return null;
      }

      const githubStarAchievementsNotCompleted =
        await context.db.achievement.findMany({
          where: {
            type: 'GITHUB_STAR',
            unlockedAchievements: { none: { userId: context.user.id } },
          },
        });

      const responses = await Promise.all(
        githubStarAchievementsNotCompleted.map((achievement) =>
          fetchGithubStarred(achievement.key, githubAccount.accessToken ?? '')
        )
      );

      const achievementAndResponse = githubStarAchievementsNotCompleted.map(
        (achievement, index) => ({
          achievement: achievement,
          response: responses[index],
        })
      );

      return achievementAndResponse
        .filter(
          (achievementAndResponse) =>
            achievementAndResponse.response?.status === 204
        )
        .map((achievementAndResponse) => ({
          achievement: achievementAndResponse.achievement,
          repository: achievementAndResponse.achievement.key,
        }));
    }),

  checkSecretCode: protectedProcedure({
    permission: null,
  })
    .route({
      method: 'POST',
      path: '/achievements/secret-code/check',
      tags,
    })
    .input(z.object({ secretCode: z.string() }))
    .output(z.object({ secretId: z.string() }))
    .handler(async ({ context, input }) => {
      const achievement = await context.db.achievement.findUnique({
        where: { key: input.secretCode },
      });

      if (!achievement) {
        throw new ORPCError('NOT_FOUND');
      }

      if (achievement.type !== 'SECRET_CODE') {
        throw new ORPCError('BAD_REQUEST', {
          data: {
            message: 'Achievement is not a secret code',
          },
        });
      }

      return { secretId: achievement.secretId };
    }),

  getById: protectedProcedure({
    permission: {
      achievement: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/achievements/{id}',
      tags,
    })
    .input(
      z.object({
        id: z.string(),
      })
    )
    .output(
      zAchievement().extend({
        secretId: z.string(),
      })
    )
    .handler(async ({ context, input }) => {
      context.logger.info('Getting achievement');
      const achievement = await context.db.achievement.findUnique({
        where: { id: input.id },
      });

      if (!achievement) {
        context.logger.warn(
          'Unable to find achievement with the provided input'
        );
        throw new ORPCError('NOT_FOUND');
      }

      return achievement;
    }),

  create: protectedProcedure({
    permission: {
      achievement: ['create'],
    },
  })
    .route({
      method: 'POST',
      path: '/achievements',
      tags,
    })
    .input(zFormFieldsAchievement())
    .output(zAchievement())
    .handler(async ({ context, input }) => {
      context.logger.info('Create achievement');
      try {
        return await context.db.achievement.create({
          data: {
            name: input.name,
            hint: input.hint ?? undefined,
            points: input.points,
            isSecret: input.isSecret,
            emoji: input.emoji ?? undefined,
            imageUrl: input.imageUrl ?? undefined,
            type: input.type,
            key: input.key ?? undefined,
          },
        });
      } catch (error: unknown) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ORPCError('CONFLICT', {
            data: {
              target: error.meta?.target,
            },
          });
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  updateById: protectedProcedure({
    permission: {
      achievement: ['update'],
    },
  })
    .route({
      method: 'POST',
      path: '/achievements/{id}',
      tags,
    })
    .input(zFormFieldsAchievement().extend({ id: z.string() }))
    .output(zAchievement())
    .handler(async ({ context, input }) => {
      context.logger.info('Update achievement');
      try {
        return await context.db.achievement.update({
          where: { id: input.id },
          data: {
            name: input.name,
            hint: input.hint ?? null,
            points: input.points,
            isSecret: input.isSecret,
            emoji: input.emoji ?? null,
            imageUrl: input.imageUrl ?? null,
            type: input.type,
            key: input.key ?? undefined,
          },
        });
      } catch (error: unknown) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ORPCError('CONFLICT', {
            data: {
              target: error.meta?.target,
            },
          });
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  deleteById: protectedProcedure({
    permission: {
      achievement: ['delete'],
    },
  })
    .route({
      method: 'DELETE',
      path: '/achievements/{id}',
      tags,
    })
    .input(
      zAchievement().pick({
        id: true,
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      context.logger.info('Delete achievement');
      try {
        await context.db.achievement.delete({
          where: { id: input.id },
        });
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  completeBySecretId: protectedProcedure({
    permission: { apps: ['app'] },
  })
    .route({
      method: 'POST',
      path: '/achievements/{id}/complete',
      tags,
    })
    .input(
      z.object({
        id: z.string(),
      })
    )
    .output(
      z.object({
        achievement: zAchievement(),
        alreadyCompleted: z.boolean(),
      })
    )
    .handler(async ({ context, input }) => {
      context.logger.info('Complete achievement for current user');

      const achievement = await context.db.achievement.findUnique({
        where: { secretId: input.id },
        include: {
          unlockedAchievements: {
            where: { userId: context.user.id },
            select: { achievementId: true },
          },
        },
      });

      if (!achievement) {
        context.logger.warn('Achievement not found');
        throw new ORPCError('NOT_FOUND');
      }

      const alreadyCompleted = achievement.unlockedAchievements.length > 0;

      if (alreadyCompleted) {
        return {
          achievement,
          alreadyCompleted,
        };
      }

      if (achievement.type !== 'GITHUB_STAR') {
        await context.db.unlockedAchievement.create({
          data: {
            achievementId: achievement.id,
            userId: context.user.id,
          },
        });

        return {
          achievement,
          alreadyCompleted,
        };
      }

      const githubAccount = await context.db.account.findFirst({
        where: {
          userId: context.user.id,
          providerId: 'github',
        },
      });

      if (!githubAccount?.accessToken) {
        throw new ORPCError('BAD_REQUEST', {
          data: {
            message: 'Github access token not found',
          },
        });
      }
      const check = await fetchGithubStarred(
        achievement.key,
        githubAccount.accessToken
      );

      if (check.status !== 204) {
        throw new ORPCError('FORBIDDEN', {
          data: {
            message: 'You are not allowed to complete this achievement',
          },
        });
      }

      await context.db.unlockedAchievement.create({
        data: {
          achievementId: achievement.id,
          userId: context.user.id,
        },
      });

      return {
        achievement,
        alreadyCompleted,
      };
    }),
};
