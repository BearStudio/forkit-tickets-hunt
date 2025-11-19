import { ORPCError } from '@orpc/client';
import dayjs from 'dayjs';
import { z } from 'zod';

import { envClient } from '@/env/client';
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
        items: z.array(zAchievement().extend({ unlockedCount: z.number() })),
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
          orderBy: [
            { points: 'desc' },
            { type: 'asc' },
            { isSecret: 'asc' },
            { isHidden: 'asc' },
            { name: 'asc' },
            { emoji: 'asc' },
          ],
          where,
          include: {
            _count: { select: { unlockedAchievements: true } },
          },
        }),
      ]);

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: items.map((item) => ({
          ...item,
          unlockedCount: item._count.unlockedAchievements,
        })),
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
    .input(z.void())
    .output(
      z.object({
        dones: z.array(zAchievement()),
        toComplete: z.array(
          zAchievement().extend({ secretId: z.string().nullish() })
        ),
        total: z.number(),
      })
    )
    .handler(async ({ context }) => {
      context.logger.info('Getting achievements with completion state');

      const [total, dones, toComplete] = await Promise.all([
        context.db.achievement.count({ where: { isHidden: false } }),
        context.db.achievement.findMany({
          orderBy: [
            { points: 'desc' },
            { type: 'asc' },
            { isSecret: 'asc' },
            { isHidden: 'asc' },
            { name: 'asc' },
            { emoji: 'asc' },
          ],
          where: {
            unlockedAchievements: { some: { userId: context.user.id } },
          },
          include: {
            unlockedAchievements: {
              where: { userId: context.user.id },
              select: { achievementId: true },
            },
          },
        }),
        context.db.achievement.findMany({
          orderBy: [
            { points: 'desc' },
            { type: 'asc' },
            { isSecret: 'asc' },
            { name: 'asc' },
            { emoji: 'asc' },
          ],
          where: {
            isHidden: false,
            unlockedAchievements: { none: { userId: context.user.id } },
          },
          include: {
            unlockedAchievements: {
              where: { userId: context.user.id },
              select: { achievementId: true },
            },
          },
        }),
      ]);

      const githubAccount = await context.db.account.findFirst({
        where: {
          userId: context.user.id,
          providerId: 'github',
        },
      });

      if (!githubAccount?.accessToken) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          data: {
            message: 'Github access token not found',
          },
        });
      }

      const githubToCheck = toComplete.filter(
        (achievement) => achievement.type === 'GITHUB_STAR'
      );

      const githubChecks = await Promise.all(
        githubToCheck.map((achievement) =>
          fetchGithubStarred(achievement.key, githubAccount.accessToken ?? '')
        )
      );

      const githuAchievementsWithCanBeClaim = githubToCheck.map(
        (achievement, index) => ({
          achievement: achievement,
          canBeClaim: githubChecks[index]?.status === 204,
        })
      );

      return {
        dones,
        toComplete: toComplete.map((item) => ({
          ...item,
          name: item.isSecret ? '???' : item.name,
          key:
            !item.isSecret && item.type === 'GITHUB_STAR'
              ? item.key
              : undefined,
          secretId:
            githuAchievementsWithCanBeClaim.find(
              (achievement) =>
                achievement.canBeClaim &&
                achievement.achievement.key === item.key
            )?.achievement.secretId ?? null,
        })),
        total,
      };
    }),

  getInAppSecret: protectedProcedure({
    permission: null,
  })
    .route({
      method: 'GET',
      path: '/achievements/in-app-secret',
      tags,
    })
    .input(z.object({ key: z.string() }))
    .output(z.string())
    .handler(async ({ context, input }) => {
      const achievement = await context.db.achievement.findUnique({
        where: { key: input.key, type: 'IN_APP' },
      });

      if (!achievement) {
        throw new ORPCError('NOT_FOUND');
      }

      return achievement.secretId;
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
    .input(z.object({ secretCode: z.string().trim() }))
    .output(z.object({ secretId: z.string() }))
    .handler(async ({ context, input }) => {
      if (input.secretCode === '') {
        const achievement = await context.db.achievement.findUnique({
          where: { key: 'empty-code' },
        });

        if (!achievement) {
          throw new ORPCError('NOT_FOUND');
        }

        return { secretId: achievement.secretId };
      }

      const achievement = await context.db.achievement.findFirst({
        where: {
          key: {
            equals: input.secretCode,
            mode: 'insensitive',
          },
        },
      });

      if (!achievement) {
        throw new ORPCError('NOT_FOUND');
      }

      if (achievement.type !== 'SECRET_CODE') {
        throw new ORPCError('NOT_FOUND');
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
            isHidden: input.isHidden,
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
            isHidden: input.isHidden,
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

      const now = dayjs();

      if (now.isAfter(envClient.VITE_EVENT_END_DATE)) {
        throw new ORPCError('BAD_REQUEST', {
          data: {
            message: 'The event has ended',
          },
        });
      }

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
