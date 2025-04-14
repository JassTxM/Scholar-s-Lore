import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";
import http from "http";
import { neon } from "@neondatabase/serverless";



const app = express();
const port = 3000;
const saltRounds = 10;
env.config();


app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);


app.use(passport.initialize());
app.use(passport.session());

// const sql= neon(process.env.DATABASE_URL);

// const requestHandler = async (req, res) => {
//   const result = await sql`SELECT version()`;
//   const { version } = result[0];
//   res.writeHead(200, { "Content-Type": "text/plain" });
//   res.end(version);
// };

// http.createServer(requestHandler).listen(4000, () => {
//   console.log("Server running at http://localhost:4000");
// });

import fs from 'fs';
// const pg = require('pg');
import url from 'url';


const config = {
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  ssl: {
      rejectUnauthorized: true,
      ca: process.env.PG_CERTIFY,
  },
};

const sql = new pg.Client(config);
sql.connect(function (err) {
  if (err)
      throw err;
  sql.query("SELECT VERSION()", [], function (err, result) {
      if (err)
          throw err;

      console.log(result.rows[0].version);
  });
});


app.get("/", (req, res) => {
  res.render("main.ejs", { title: "Scholar's Lore - Home", pageTitle: "Scholar's Lore" });
});

app.get("/login", (req, res) => {
  res.render("login.ejs", { title: "Login - Scholar's Lore", pageTitle: "LOGIN" });
});

app.get("/register", (req, res) => {
  res.render("register.ejs", { title: "Register - Scholar's Lore", pageTitle: "REGISTER" });
});

app.get("/home", (req, res) => {
  res.render("home.ejs", { title: "Scholar's Lore - Home", pageTitle: "Scholar's Lore" });
});

app.get("/plans", (req, res) => {
  res.render("plans.ejs", { title: "Scholar's Lore - Plans", pageTitle: "PLANS" });
});

app.get("/bill", (req, res) => {
  res.render("bill.ejs", { title: "Scholar's Lore - Billing", pageTitle: "BILLING" });
});

app.get("/about", (req, res) => {
  res.render("about.ejs", { title: "Scholar's Lore - About Us", pageTitle: "ABOUT US" });
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs", { title: "Scholar's Lore - Contact Us", pageTitle: "CONTACT US" });
});

app.get("/social/github", (req, res) => {
  res.render("github.ejs", { title: "Scholar's Lore - Github", pageTitle: "GITHUB" });
});

app.get("/social/linkedin", (req, res) => {
  res.render("linkedin.ejs", { title: "Scholar's Lore - Linkedin", pageTitle: "LINKEDIN" });
});

app.get("/social/twitter", (req, res) => {
  res.render("twitter.ejs", { title: "Scholar's Lore - Twitter", pageTitle: "TWITTER" });
});

app.get("/help-center", (req, res) => {
  res.render("help-center.ejs", { title: "Scholar's Lore - Help Center", pageTitle: "HELP CENTER" });
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/courses", async (req, res) => {
  try {
    const coursesResult = await sql.query(
      "SELECT courseid, name, thumbnail FROM courses ORDER BY courseid ASC");

    res.render("courses.ejs", {
      title: "Scholar's Lore - Courses",
      pageTitle: "COURSES",
      courses: coursesResult.rows 
    });
  } catch (error) {
    console.error('Database error:', error);
  
    res.render("courses.ejs", {
      title: "Scholar's Lore - Courses",
      pageTitle: "COURSES",
      courses: [] 
    });
  }
});

app.get("/course/:id", async (req, res) => {
  try {
      const courseId = req.params.id;
      const result = await sql.query(
         "SELECT * FROM courses WHERE courseid = $1",
          [courseId]
      );

      if (result.rows.length > 0) {
          res.render("course-details.ejs", {
              title: `${result.rows[0].name} - Scholar's Lore`,
              pageTitle: result.rows[0].name,
              course: result.rows[0]
          });
      } else {
          res.status(404).render("error.ejs", {
              title: "Course Not Found",
              pageTitle: "404 ERROR",
              message: "Course not found"
          });
      }
  } catch (error) {
      console.error('Error:', error);
      res.status(500).render("error.ejs", {
          title: "Error",
          pageTitle: "ERROR",
          message: "An error occurred while loading the course"
      });
  }
});

app.get("/submit",(req,res)=>{
  if(req.isAuthenticated()){
  res.render("/home");
}else{
  res.redirect("/login");
}
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/sl_redirect",
  passport.authenticate("google", {
    successRedirect: "/home",
    failureRedirect: "/login",
  })
);

app.post('/submit-contact', (req, res) => {
  console.log('Contact form submission:', req.body);
  
  res.send(`
    <script>
      alert('Your request has been sent. Please wait till our team contacts you!');
      window.location.href = '/contact';
    </script>
  `);
});


app.post('/bill-payment', (req, res) => {
  console.log('Payment form submission:', req.body);
  
  res.send(`
    <script>
      alert('Payment processed successfully! Redirecting to confirmation page...');
      window.location.href = '/home';
    </script>
  `);
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
  })
);

app.post("/register", async (req, res) => {
  const name = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const checkResult = await sql.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult && checkResult.rows && checkResult.rows.length > 0) {
      res.redirect("/login");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await sql.query(
            "INSERT INTO users (name,email,password) VALUES ($1, $2,$3) RETURNING *",
            [name,email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            console.log("success");
            res.redirect("/home");
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

passport.use(
  "local",
  new Strategy(async function verify(email, password, cb) {
    try {
      const result = await sql.query("SELECT * FROM users WHERE email = $1 ", [
        email,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/sl_redirect",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        console.log(profile);
        const result = await sql.query("SELECT * FROM users WHERE email = $1", [
          profile.email,
        ]);
        if (result.rows.length === 0) {
          const newUser = await sql.query(
            "INSERT INTO users (name,email, password) VALUES ($1, $2,$3)",
            [profile.name,profile.email, "google"]
          );
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
  
