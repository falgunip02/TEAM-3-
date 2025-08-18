const BASE_URL = "http://localhost:8000/api";
// <--- Make sure this matches your backend port

const API_ENDPOINTS = {
    auth: {
        signin: `${BASE_URL}/auth/signin`,
        signup: `${BASE_URL}/auth/signup`,
    },
    menu: {


        getAll: `${BASE_URL}/menu`,
        getAvailable: `${BASE_URL}/menu/available`,
        add: `${BASE_URL}/menu`,
        update: (id ) => `${BASE_URL}/menu/${id}`,
        delete: (id) => `${BASE_URL}/menu/${id}`,
    },
    orders: {
        getAll: `${BASE_URL}/orders`,
        getUserOrders: (userId) => `${BASE_URL}/orders/user/${userId}`,
        placeOrder: `${BASE_URL}/orders`,
        updateStatus: (id) => `${BASE_URL}/orders/${id}/status`,
    },
    payments: {
        createPaymentIntent: `${BASE_URL}/payments/create-payment-intent`,
        confirmPayment: `${BASE_URL}/payments/confirm-payment`,
    },
};

export default API_ENDPOINTS;