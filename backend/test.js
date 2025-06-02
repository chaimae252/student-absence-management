const bcrypt = require("bcrypt");
const password = "taehyung";

bcrypt.hash(password, 10).then(hash => {
  console.log("✅ New hash for admin123:", hash);
});
