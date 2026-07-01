import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
});

// Classes
export const getClasses = () => API.get('/classes/');
export const createClass = (data) => API.post('/classes/', data);

// Students
export const getStudents = () => API.get('/students/');
export const createStudent = (data) => API.post('/students/', data);

// Guardians
export const createGuardian = (data) => API.post('/guardians/', data);

// Invoices
export const getInvoices = () => API.get('/invoices/');
export const getStudentInvoices = (studentId) => API.get(`/invoices/?student=${studentId}`);
export const createInvoice = (data) => API.post('/invoices/', data);

// Payments
export const getPayments = () => API.get('/payments/');
export const createPayment = (data) => API.post('/payments/', data);
export const confirmPayment = (id, data) => API.post(`/payments/${id}/confirm/`, data);
export const rejectPayment = (id, data) => API.post(`/payments/${id}/reject/`, data);