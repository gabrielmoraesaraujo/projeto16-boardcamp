import { getCustomerById, getCustomers, insertCustomer, updateCustomer } from '../controllers/customersController.js';
import { Router } from 'express';

const router = Router();

router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);
router.post('/customers', insertCustomer);
router.put('/customers/:id', updateCustomer);

export default router;