import { createTRPCRouter } from "./create-context";
import { exampleRouter } from "./routes/example";
import { weddingRouter } from "./routes/wedding";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  wedding: weddingRouter,
});

export type AppRouter = typeof appRouter;
