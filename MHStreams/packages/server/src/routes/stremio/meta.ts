import { Router, Request, Response, NextFunction } from 'express';
import {
  MHStreams,
  MetaResponse,
  createLogger,
  StremioTransformer,
} from '@mhstreams/core';

import { stremioMetaRateLimiter } from '../../middlewares/ratelimit.js';

const logger = createLogger('server');
const router: Router = Router();

router.use(stremioMetaRateLimiter);

interface MetaParams {
  type: string;
  id: string;
}

router.get(
  '/:type/:id.json',
  async (req: Request<MetaParams>, res: Response<MetaResponse>, next: NextFunction) => {
    if (!req.userData) {
      res.status(200).json({
        meta: StremioTransformer.createErrorMeta({
          errorDescription: 'Please configure the addon first',
        }),
      });
      return;
    }
    const transformer = new StremioTransformer(req.userData);
    try {
      const { type, id } = req.params;
      logger.debug('Meta request received', {
        type,
        id,
        userData: req.userData,
      });

      if (id.startsWith('mhstreamserror.')) {
        res.status(200).json({
          meta: StremioTransformer.createErrorMeta(
            JSON.parse(decodeURIComponent(id.split('.').slice(1).join('.')))
          ),
        });
        return;
      }

      const mhstreams = new MHStreams(req.userData);
      await mhstreams.initialise();

      const meta = await mhstreams.getMeta(type, id);
      const streamContext = mhstreams.getStreamContext();

      const transformed = await transformer.transformMeta(
        meta,
        streamContext?.toFormatterContext(),
        {
          provideStreamData: true,
        }
      );
      if (!transformed) {
        next();
      } else {
        res.status(200).json(transformed);
      }
    } catch (error) {
      next(error);
    }
  }
);

export default router;
