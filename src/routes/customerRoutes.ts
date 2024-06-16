import { Router } from 'express';
import { protect, admin } from "../middleware/authMiddleware";
import CustomerController from '../controllers/CustomerController';

const customerRouter = Router();

customerRouter.post('/create', protect, CustomerController.createCustomer);

customerRouter.get('/all', protect, CustomerController.getAllCustomers);

customerRouter.get('/:id', protect, CustomerController.getCustomerById);

customerRouter.put('/search', protect, CustomerController.searchCustomers);

customerRouter.put('/update/:id', protect, CustomerController.updateCustomer);

customerRouter.delete('/delete/:id', protect, admin, CustomerController.deleteCustomer);

customerRouter.post('/send-email/:id', protect, CustomerController.sendEmail);

customerRouter.post('/send-email-to-all', protect, admin, CustomerController.sendEmailToAllCustomers);

export default customerRouter;