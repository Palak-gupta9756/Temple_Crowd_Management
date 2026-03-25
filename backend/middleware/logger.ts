import { Request, Response, NextFunction } from "express";

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      console.log(
        `${req.method} ${path} ${res.statusCode} in ${Date.now() - start}ms`
      );
    }
  });

  next();
};
