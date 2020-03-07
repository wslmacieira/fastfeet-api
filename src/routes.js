import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliveryManageController from './app/controllers/DeliveryManageController';
import DeliverymanManageController from './app/controllers/DeliverymanManageController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

// routes Deliveryman
routes.get('/deliveryman/:id/deliveries', DeliveryManageController.index);
routes.get(
  '/deliveryman/:id/delivery/:delivery_id',
  DeliveryManageController.show
);

// routes Deliveryman delivery
routes.get(
  '/deliveryman/:id/manage/deliveries',
  DeliverymanManageController.index
);
routes.put(
  '/deliveryman/:id/manage/deliveries/:delivery_id',
  DeliverymanManageController.update
);

// routes Admin
routes.use(authMiddleware);
routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

routes.get('/recipients', RecipientController.index);
routes.get('/recipients/:id', RecipientController.show);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.get('/deliverymen', DeliverymanController.index);
routes.get('/deliverymen/:id', DeliverymanController.show);
routes.post('/deliverymen', DeliverymanController.store);
routes.put('/deliverymen/:id', DeliverymanController.update);
routes.delete('/deliverymen/:id', DeliverymanController.delete);

routes.get('/deliveries', DeliveryController.index);
routes.get('/deliveries/:id', DeliveryController.show);
routes.post('/deliveries', DeliveryController.store);
routes.put('/deliveries/:id', DeliveryController.update);
routes.delete('/deliveries/:id', DeliveryController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
