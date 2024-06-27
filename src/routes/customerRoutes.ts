import { Router } from 'express';
// import { authenticateUser, authorizeAdmin } from "../middleware/authMiddleware";
import CustomerController from '../controllers/CustomerController';

const customerRouter = Router();

// customerRouter.post('/create', authenticateUser, CustomerController.createCustomer);

// customerRouter.get('/all', authenticateUser, CustomerController.getAllCustomers);

// customerRouter.get('/:id', authenticateUser, CustomerController.getCustomerById);

// customerRouter.put('/search', authenticateUser, CustomerController.searchCustomers);

// customerRouter.put('/update/:id', authenticateUser, CustomerController.updateCustomer);

// customerRouter.delete('/delete/:id', authenticateUser, authorizeAdmin, CustomerController.deleteCustomer);

// customerRouter.post('/send-email/:id', authenticateUser, CustomerController.sendEmail);

// customerRouter.post('/send-email-to-all', authenticateUser, authorizeAdmin, CustomerController.sendEmailToAllCustomers);

export default customerRouter;