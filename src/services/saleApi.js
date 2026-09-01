import api, { getListOrEmpty, extractItem } from './api';

// IMPORTANT: api/sale.js is fully implemented on the backend (1000 lines,
// covers item stock checks, FEFO-safe locking, tax/discount calculation,
// multi-payment splits) but it is NOT mounted in index.js. Every call below
// will 404 at the Express level until the backend adds:
//   const sale = require("./api/sale"); app.use("/api/sale", sale);
// The frontend is still built fully against its real contract so that
// POS/Sales works the moment the backend mounts the route.

export async function createSale(payload) {
  // payload: { organization_id, location_id, invoice_number, customer_name,
  //            customer_phone, discount, created_by,
  //            items: [{ product_id, batch_id, quantity, unit_price, tax_percent }],
  //            payments: [{ payment_method, amount, transaction_reference }] }
  const response = await api.post('/sale/create', payload);
  return extractItem(response.data);
}

export async function getSales(params = {}) {
  // params: organization_id, location_id, invoice_number, customer_name,
  //         customer_phone, created_by, start_date, end_date, min_amount, max_amount
  return getListOrEmpty(api.get('/sale/get', { params }));
}
