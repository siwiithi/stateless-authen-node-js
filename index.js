const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json()); // ทำให้รับ json จาก body ได้
const jwt = require("jwt-simple");
const passport = require("passport");
// ใช้ในการ decode jwt ออกมา
const ExtractJwt = require("passport-jwt").ExtractJwt;
// ใช้ในการประกาศ Strategy
const JwtStrategy = require("passport-jwt").Strategy;

const SECRET = "MY_SECRET_KEY"; // ในการใช้งานจริง คีย์นี้ให้เก็บเป็นความลับ

const middleware = (req, res, next) => {
    /* ตรวจสอบว่า authorization คือ Boy หรือไม่ */
    if(req.headers.authorization === "Boy")
    next(); // อนุญาติให้ไปฟังก์ชันถัดไป
    else
        res.send("ไม่อนุญาต") 
};

const requireJWTAuth = passport.authenticate("jwt", {session:false});

app.get("/", requireJWTAuth, (req, res) => { // เพิ่ม middleware ขั้นกลาง
    res.send("ยอดเงินคงเหลือ 50");
});

app.listen(3000);


const loginMiddleware = (req, res, next) => {
    if( req.body.username === "donghae" &&
        req.body.password === "lee") next();
    else  res.send("Wrong username and password")
    // ถ้า username password ไม่ตรงให้ส่งว่า Wrong username and password
}

// เพิ่ม code ลงไปใน app.post("/login")
app.post("/login", loginMiddleware, (req, res) => {
  const payload = {
    sub: req.body.username,
    iat: new Date().getTime() // มาจากคำว่า issued at time (สร้างเมือ)
  };
  res.send(jwt.encode(payload, SECRET));
});


const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"),
  secretOrKey: SECRET, // SECRET เดียวกับตอน encode ในกรณีนี้คือ MY_SECRET_KEY
}
const jwtAuth = new JwtStrategy(jwtOptions, (payload, done) => {
  if(payload.sub === "donghae") done(null, true); 
  /* function callback "done" parameters ตัวแรกหมายถึง error ตัวที่สองคือ ผ่านหรือไม่ผ่าน done(errorOrNot, passOrNot); */
  else done(null, false);
});

passport.use(jwtAuth);