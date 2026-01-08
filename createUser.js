const bcrypt = require("bcryptjs")
const mysql = require("mysql2")

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "vertcorps"
})

async function createUser() {

  const hash = await bcrypt.hash("123456", 10)

  // ✅ Admin user (your original user)
  db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)",
    [
      "Malumbo Thindwa",
      "admin@vertcorps.com",
      hash,
      "admin"
    ],
    () => console.log("✅ Admin user created")
  )

  // ✅ District EDO user (NEW)
  db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)",
    [
      "Ireen Yabunya",
      "malumbothindwa81@gmail.com",
      hash,
      "district_EDO"
    ],
    () => console.log("✅ District EDO user created")
  )

}

createUser()
