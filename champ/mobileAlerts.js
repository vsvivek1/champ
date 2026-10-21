import fs from "fs";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";

// __dirname replacement in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const serviceAccountPath = path.join(
//   __dirname,""
//   "serviceAccountKey.json"
// );

let serviceAccountPath = path.join(__dirname,"..", "MobileAlerts","serviceAccountKey.json");

//const serviceAccountPath ="../MobileAlerts/serviceAccountKey.json";

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sendNotification(title, body) {
  await admin.messaging().send({
    token: "f3RVzEC8TZCsaajYiXKZJz:APA91bEIPDhDl699GVvmTaAwmusipTc91mRu1BHs8jCnKjTeWvpftK7eRQQxV-RKkLCrAjx0qyOP9RrS0BabEipncV6_OiVX-KVpiWvVk91DJH8FAyaVcHw",
    notification: {
      title,
      body
    }
  });

 // console.log("Notification sent!");
}

//sendNotification("Test Notification","This is a test notification from the server!").catch(console.error);

export { sendNotification };