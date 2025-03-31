import Razorpay from "razorpay";

const getRazorpayInstance = function () {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_SECRET_KEY!,
  });
};

export {
    getRazorpayInstance
}