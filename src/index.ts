"use strict";

import environment from "@/lib/environment.ts";
import config from "@/lib/config.ts";
import "@/lib/initialize.ts";
import server from "@/lib/server.ts";
import routes from "@/api/routes/index.ts";
import logger from "@/lib/logger.ts";

// 仅当本地/传统启动时监听端口
if (typeof process !== 'undefined' && process.env.VERCEL !== '1') {
  const startupTime = performance.now();
  (async () => {
    logger.header();
    logger.info("<<<< kimi free server >>>>");
    logger.info("Version:", environment.package.version);
    logger.info("Process id:", typeof process !== 'undefined' ? process.pid : 'unknown');
    logger.info("Environment:", environment.env);
    logger.info("Service name:", config.service.name);
    server.attachRoutes(routes);
    await server.listen();
    config.service.bindAddress &&
      logger.success("Service bind address:", config.service.bindAddress);
  })()
    .then(() =>
      logger.success(
        `Service startup completed (${Math.floor(performance.now() - startupTime)}ms`
      )
    )
    .catch((err) => console.error(err));
}

// Vercel Serverless 兼容导出
// 仅类型导入，避免构建时找不到模块
import type { VercelRequest, VercelResponse } from '@vercel/node';

const koaApp = server.app;

// Vercel Serverless 入口
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Koa callback 兼容 Node.js 原生 http server
  return koaApp.callback()(req, res);
}
