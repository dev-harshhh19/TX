import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Registration API
export const registerForEvent = async (data: any) => {
    const response = await api.post('/registrations', data);
    return response.data;
};

// --- Mock Data ---
const MOCK_USERS = [
    { _id: 'u1', username: 'student1', email: 's1@test.com', role: 'user', college: 'IITB', points: 100 },
    { _id: 'u2', username: 'student2', email: 's2@test.com', role: 'user', college: 'NITK', points: 50 },
    { _id: 'u3', username: 'Sanskar', email: 'sanskar@admin.com', role: 'admin', college: 'TX', points: 9999 },
];

const MOCK_REGISTRATIONS = [
    { _id: 'r1', user: { username: 'student1' }, event: { title: 'Tech Summit' }, type: 'Self', date: new Date().toISOString() },
    { _id: 'r2', user: { username: 'student2' }, event: { title: 'Code Wars' }, type: 'Group', date: new Date().toISOString() },
];

// Helper to check for manual login token
const isManualLogin = () => {
    const token = localStorage.getItem('token');
    return token && token.startsWith('manual-bypass-token-');
};

export const getRegistrations = async () => {
    if (isManualLogin()) return MOCK_REGISTRATIONS;
    const response = await api.get('/registrations');
    return response.data;
};

export const getAllUsers = async () => {
    if (isManualLogin()) return MOCK_USERS;
    const response = await api.get('/users');
    return response.data;
};

// --- Mock Data ---

const MOCK_EVENTS = [
    { _id: '1', title: 'Tech Summit 2026', category: 'Conference', fee: 500, date: new Date().toISOString() },
    { _id: '2', title: 'Code Wars', category: 'Hackathon', fee: 0, date: new Date().toISOString() },
    { _id: '3', title: 'AI Workshop', category: 'Workshop', fee: 200, date: new Date().toISOString() },
];

const MOCK_PAYMENTS = [
    { _id: 'p1', userId: { username: 'testuser', email: 'test@example.com' }, eventId: { title: 'Tech Summit 2026' }, amount: 500, status: 'pending' },
    { _id: 'p2', userId: { username: 'dev_jane', email: 'jane@example.com' }, eventId: { title: 'AI Workshop' }, amount: 200, status: 'success' },
];

const MOCK_TRANSACTIONS = [
    { _id: 't1', userId: { username: 'Sanskar' }, type: 'credit', action: 'Manual Adjustment', metadata: { reason: 'Admin' }, createdAt: new Date().toISOString() },
    { _id: 't2', userId: { username: 'Faculty' }, type: 'debit', action: 'Event Creation', metadata: { event: 'Code Wars' }, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const MOCK_ITEMS = [
    { _id: 'i1', title: 'Gaming Laptop', type: 'auction', currentBid: 45000, highestBidder: { username: 'gamer1' }, status: 'active' },
    { _id: 'i2', title: 'Mechanical Keyboard', type: 'sale', price: 3000, status: 'active' },
];

// --- Modified API Calls ---

export const getTransactions = async () => {
    if (isManualLogin()) return MOCK_TRANSACTIONS;
    const response = await api.get('/transactions');
    return response.data;
};

// Auth API
export const login = async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

export const register = async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getMyRegistrations = async () => {
    const response = await api.get('/registrations/my-registrations');
    return response.data;
};

export const getMyTransactions = async () => {
    const response = await api.get('/transactions/my-transactions');
    return response.data;
};

// Notifications API
export const createNotification = async (data: any) => {
    const response = await api.post('/notifications', data);
    return response.data;
};

export const getMyNotifications = async () => {
    const response = await api.get('/notifications/my-notifications');
    return response.data;
};

export const markNotificationAsRead = async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};

export const getEvents = async () => {
    if (isManualLogin()) return MOCK_EVENTS;
    const response = await api.get('/events');
    return response.data;
};

export const getEventParticipants = async (eventId: string) => {
    if (isManualLogin()) return [
        { _id: 'u1', username: 'student1', email: 's1@test.com', phone: '1234567890', college: 'IITB' },
        { _id: 'u2', username: 'student2', email: 's2@test.com', phone: '0987654321', college: 'NITK' }
    ];
    const response = await api.get(`/events/${eventId}/participants`);
    return response.data;
};

export const getPayments = async () => {
    if (isManualLogin()) return MOCK_PAYMENTS;
    const response = await api.get('/payments');
    return response.data;
};

export const updatePaymentStatus = async (id: string, status: string) => {
    if (isManualLogin()) return { success: true };
    const response = await api.patch(`/payments/${id}/status`, { status });
    return response.data;
};


export const getItems = async () => {
    if (isManualLogin()) return MOCK_ITEMS;
    const response = await api.get('/marketplace');
    return response.data;
};

export const bidItem = async ({ id, amount }: { id: string; amount: number }) => {
    if (isManualLogin()) return { success: true };
    const response = await api.post(`/marketplace/${id}/bid`, { amount });
    return response.data;
};

export const buyItem = async (id: string) => {
    if (isManualLogin()) return { success: true };
    const response = await api.post(`/marketplace/${id}/buy`);
    return response.data;
};

export const createItem = async (data: any) => {
    if (isManualLogin()) return { success: true, item: data };
    const response = await api.post('/marketplace', data);
    return response.data;
};

// ... existing auth ...
export default api;
