// eslint-disable-next-line no-unused-vars
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.addAdminRole = functions.https.onCall((data, context) => {
  // check request is made by an admin
  if (context.auth.token.admin !== true) {
    return {error: "Only admins can add other admins, sucker!"};
  }

  // get user and add custom claim(admin)
  return admin.auth().getUserByEmail(data.email).then((user) => {
    return admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
    });
  }).then(() => {
    console.log("Admin: " + data.message);
    return {
      message: `Success! ${data.email} has been made an admin`,
    };
  }).catch((err) => {
    return err;
  });
});
