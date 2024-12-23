const passport = require("passport");
const bcrypt = require("bcrypt");
const express = require("express");

const app = express();

module.exports = function (app, myDataBase) { };

app.route("/").get((req, res) => {
  res.render("index", {
    title: "Connected to Database",
    message: "Please log in",
    showLogin: true,
    showRegistration: true,
  });
});

app
  .route("/login")
  .post(
    passport.authenticate("local", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/profile");
    }
  );

app.route("/profile").get(ensureAuthenticated, (req, res) => {
  res.render("profile", { username: req.user.username });
});

app.route("/logout").get((req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error logging out");
    } else {
      res.redirect("/");
    }
  });
});

app.route("/register").post(
  (req, res, next) => {
    const hash = bcrypt.hashSync(req.body.password, 12);
    myDataBase.findOne({ username: req.body.username }, (err, user) => {
      if (err) {
        next(err);
      } else if (user) {
        res.redirect("/");
      } else {
        myDataBase.insertOne(
          {
            username: req.body.username,
            password: hash,
          },
          (err, doc) => {
            if (err) {
              res.redirect("/");
            } else {
              // The inserted document is held within
              // the ops property of the doc
              next(null, doc.ops[0]);
            }
          }
        );
      }
    });
  },
  passport.authenticate("local", { failureRedirect: "/" }),
  (req, res, next) => {
    res.redirect("/profile");
  }
);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};