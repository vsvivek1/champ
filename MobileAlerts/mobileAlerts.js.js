const fs = require("fs");



const admin = require("firebase-admin");

const path = require("path");
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

async function sendNotification(title, body) {
  await admin.messaging().send({
    token: "f3RVzEC8TZCsaajYiXKZJz:APA91bEIPDhDl699GVvmTaAwmusipTc91mRu1BHs8jCnKjTeWvpftK7eRQQxV-RKkLCrAjx0qyOP9RrS0BabEipncV6_OiVX-KVpiWvVk91DJH8FAyaVcHw",
    notification: {
      title: title,
      body: body,
    }
  });

  console.log("Notification sent!");
}




sendNotification("Test Notification", "This is a test notification from the server!").catch(console.error);
module.exports = { sendNotification };
export { sendNotification };
