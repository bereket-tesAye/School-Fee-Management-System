import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
});

// Add token to requests if it exists
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('parentToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
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

// Parent authentication
export const parentLogin = (email, password) =>
    API.post('/parent/login/', { email, password });

export const parentRegister = (email, password, guardianId) =>
    API.post('/parent/register/', { email, password, guardian_id: guardianId });

// Parent data - just use the same API with token interceptor
export const getParentInvoices = () => API.get('/parent/invoices/');

export const createParentPayment = (data) => API.post('/parent/payments/', data);

export const getParentPayments = () => API.get('/parent/payments/');