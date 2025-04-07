## Problem Statement -> When we pay on youtube in chat and youtube take 60% of the payment and the popup is irritating. The payment is not instant. Youtube-> GPay-> takes money

## Solution -> Our Solution provides the functionality with less margin and the transfer is within one or 2 business days. Filter can be added for Sorting and Markinig

## ☁️ Server setup

### Config

- **BASE_URL = **/api/v1
- **DATABASE = **postgres
- **PAYMENT_PAYOUT_GATEWAY =** cashfree
- **CACHE_DB =** redis
- **MAIL_TRANSPORTER =** mailgun

### Routes

🛣️ **Auth Routes**

- [x] /auth/verify `GET`
- [x] /auth/login `POST`
- [x] /auth/register `POST`
- [x] /auth/resend-email `POST`
- [x] /auth/forgot-password `POST`

🛣️ **User Routes**

- [x] /user `GET`
- [x] /user `PUT` _// updates the user data except password_
- [x] /user/reset-password `PUT`
- [ ] /user/restrict-account `DELETE`

🛣️ **Streamer Routes**

- [ ] /streamer/block-user `POST` // block a user from messaging
- [x] /streamer/stream `POST` // create new stream for streaming
- [x] /streamer/stream/:id `DELETE` // delete the chat streaming server
      🛣️ **Payout Routes (Payment gateway verfied route)**

- [ ] /payout/beneficiary `GET` // get beneficiary details
- [ ] /payout/beneficiary `POST` // create new beneficiary
- [ ] /payout/update-beneficiary `POST` // delete old beneficiary and create new with the same id
- [ ] /payout/beneficiary `DELETE` // remove the beneficiary
- [ ] /payout/verify-beneficiary-details `POST` // verify beneficiary details by aadhar, pan, bank account, UPI verify
- [ ] /payout/beneficiary-history `GET` // get all beneficiary history
- [ ] /payout/standard-transfer `POST` // create standard payment transfer to beneficiary account.
      🌉** Middleware**

- [x] express authentication middleware
- [x] [socket.io](https://socket.io/) authentication middleware

## 💻 Web client setup

### 🛣️ Routes

- [x] /auth/login
- [x] /auth/verify
- [x] /auth/register
- [x] /auth/resend-email
- [ ] /profile
- [ ] /profile/reset-password
- [x] /stream/`:id`
- [x] /dashboard
- [x] /dashboard/stream/`:id`

## 📝 Notes

- Use zod
- postgres db
- redis for socketio management
- admin will be connected through web sockets & can send messages with rest api.
- users will get data through polling and send payments & messages with rest api.
- once beneficiary is created we can't update beneficiary details.

## What we need to host this bare minimum socket server live:

- Postgres service - aiven
- Redis service
- Server - onrender
- Vite - vercel
