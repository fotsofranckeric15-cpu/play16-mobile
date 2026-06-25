import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

async function getToken() { return await AsyncStorage.getItem('play16_token'); }

async function request(method, path, body=null, requiresAuth=true) {
  const token = requiresAuth ? await getToken() : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Erreur ${response.status}`);
    return data;
  } catch (err) {
    if (err.message === 'Network request failed') throw new Error('Pas de connexion. Vérifiez votre réseau.');
    throw err;
  }
}

export const getAppConfig = () => request('GET', '/api/features/app-config', null, false);
export const requestOTP = (phone_number) => request('POST', '/api/auth/request-otp', { phone_number }, false);
export const verifyOTP = (phone_number, code) => request('POST', '/api/auth/verify-otp', { phone_number, code }, false);
export const acceptCGU = (version) => request('POST', '/api/auth/accept-cgu', { version });
export const getCurrentCGU = () => request('GET', '/api/superadmin/cgu/current', null, false);
export const getProducts = (params={}) => { const qs=new URLSearchParams(params).toString(); return request('GET', `/api/products${qs?'?'+qs:''}`); };
export const getProduct = (id) => request('GET', `/api/products/${id}`);
export const clickProduct = (id) => request('POST', `/api/products/${id}/click`);
export const requestBoost = (product_id, level) => request('POST', `/api/products/${product_id}/boost-request`, { level });
export const createOrder = (product_variant_id, payment_method) => request('POST', '/api/orders', { product_variant_id, payment_method });
export const getMyOrders = (status) => request('GET', `/api/orders/my${status?'?status='+status:''}`);
export const confirmReceipt = (order_id) => request('POST', `/api/orders/${order_id}/confirm-receipt`);
export const updateLocation = (delivery_id, latitude, longitude) => request('POST', `/api/deliveries/${delivery_id}/location`, { latitude, longitude });
export const toggleLocationSharing = (delivery_id, enabled) => request('PUT', `/api/deliveries/${delivery_id}/location/sharing`, { enabled });
export const acceptDelivery = (delivery_id) => request('POST', `/api/deliveries/${delivery_id}/accept`);
export const completeDelivery = (delivery_id) => request('POST', `/api/deliveries/${delivery_id}/complete`);
export const createCashWorkPost = (description, location_lat, location_lng) => request('POST', '/api/cashwork/posts', { description, location_lat, location_lng });
export const getCashWorkPosts = (params={}) => { const qs=new URLSearchParams(params).toString(); return request('GET', `/api/cashwork/posts${qs?'?'+qs:''}`); };
export const acceptCashWorkPost = (post_id) => request('POST', `/api/cashwork/posts/${post_id}/accept`);
export const submitInvoice = (mission_id, amount) => request('POST', `/api/cashwork/missions/${mission_id}/invoice`, { amount });
export const acceptInvoice = (mission_id) => request('POST', `/api/cashwork/missions/${mission_id}/accept-invoice`);
export const validateMission = (mission_id) => request('POST', `/api/cashwork/missions/${mission_id}/validate`);
export const initExternalPayment = (data) => request('POST', '/api/external-payments', data);
export const acceptExternalPayment = (id, seller_full_name, seller_birth_date) => request('POST', `/api/external-payments/${id}/accept`, { seller_full_name, seller_birth_date });
export const confirmShipment = (id) => request('POST', `/api/external-payments/${id}/confirm-shipment`);
export const receivePackage = (id, accepted, was_video_ignored) => request('POST', `/api/external-payments/${id}/reception`, { accepted, was_video_ignored });
export const getPublicSetting = (key) => request('GET', `/api/settings/public/${key}`, null, false);
export const saveToken = async (token) => AsyncStorage.setItem('play16_token', token);
export const clearToken = async () => { await AsyncStorage.removeItem('play16_token'); await AsyncStorage.removeItem('play16_user'); };
export const saveUser = async (user) => AsyncStorage.setItem('play16_user', JSON.stringify(user));
export const getUser = async () => { const u = await AsyncStorage.getItem('play16_user'); return u ? JSON.parse(u) : null; };
