import { InferRouterInputs, InferRouterOutputs } from '@orpc/server';

import accountRouter from './routers/account';
import achievementRouter from './routers/achievement';
import configRouter from './routers/config';
import userRouter from './routers/user';

export type Router = typeof router;
export type Inputs = InferRouterInputs<typeof router>;
export type Outputs = InferRouterOutputs<typeof router>;
export const router = {
  account: accountRouter,
  achievement: achievementRouter,
  user: userRouter,
  config: configRouter,
};
