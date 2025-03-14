## Problem Statement -> When we pay on youtube in chat and youtube take 60% of the payment and the popup is irritating. The payment is not instant. Youtube-> GPay-> takes money 
## Solution -> Our Solution provides the functionality with less margin and the transfer is within one or 2 business days. Filter can be added for Sorting and Markinig 

##  ☁️ Server setup
### Config
- **BASE_URL = **/api/v1
- **DATABASE = **postgres
- **PAYMENT_PAYOUT_GATEWAY =** cashfree
- **CACHE_DB =** redis
- **MAIL_TRANSPORTER =** mailgun
### Routes
 🛣️ **Auth Routes**

- [x] /auth/verify `GET`  
- [x] /auth/login  `POST`  
- [x] /auth/register  `POST`
- [x] /auth/resend-email `POST`
- [ ] /auth/forgot-password  `POST` 

🛣️ **User Routes**

- [ ] /user  `GET` 
- [ ] /user  `PUT`                         _// updates the user data except password_
- [ ] /user/reset-password `PUT` 
- [ ] /user/restrict-account `DELETE` 

🛣️ **Streamer Routes**

- [ ] /streamer/block-user `POST`     // block a user from messaging
- [ ] /streamer/stream `POST`            // create new stream for streaming
- [ ] /streamer/stream/:id `DELETE`         // delete the chat streaming server
🛣️ **Payout Routes (Payment gateway verfied route)**

- [ ] /payout/beneficiary `GET`  // get beneficiary details
- [ ] /payout/beneficiary `POST`  // create new beneficiary
- [ ] /payout/update-beneficiary `POST`  // delete old beneficiary and create new with the same id
- [ ] /payout/beneficiary `DELETE`  // remove the beneficiary
- [ ] /payout/verify-beneficiary-details  `POST`  // verify beneficiary details by aadhar, pan, bank account, UPI  verify
- [ ] /payout/beneficiary-history `GET`  // get all beneficiary history
- [ ] /payout/standard-transfer `POST`  // create standard payment transfer to beneficiary account.
🌉** Middleware**

- [ ] express authentication middleware
- [ ] [socket.io](https://socket.io/) authentication middleware


## 💻 Web client setup
### 🛣️ Routes
- [ ] /auth/login
- [ ] /auth/verify
- [ ] /auth/register
- [ ] /auth/resend-email
- [ ] /profile
- [ ] /profile/reset-password
- [ ] /stream/`:id` 
- [ ] /dashboard
- [ ] /dashboard/stream/`:id` 


## 📝 Notes
- Use zod
- postgres db
- redis for socketio management
- admin will be connected through web sockets & can send messages with rest api.
- users will get data through polling and send payments & messages with rest api.
- once beneficiary is created we can't update beneficiary details.
