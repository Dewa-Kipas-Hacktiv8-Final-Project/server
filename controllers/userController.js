const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const generateToken = require("../helpers/jwt");

class UserController {
  static register(req, res, next) {
    const { username, email, password } = req.body;
    User.create({
      username,
      email,
      password,
    })
      .then((user) =>
        res.status(201).json({
          id: user.id,
          username: user.username,
          email: user.email,
          pictureUrl: user.pictureUrl,
        })
      )
      .catch((err) => next(err));
  }
  static login(req, res, next) {
    const { email, password } = req.body;
    if (!email) throw { name: "INVALID_DATA", message: "Email Required!" };
    User.findOne({
      where: {
        email,
      },
    })
      .then((user) => {
        if (!user)
          throw { name: "INVALID_DATA", message: "invalid email/password" };
        if (!password)
          throw { name: "INVALID_DATA", message: "Password Required!" };
        const match = comparePassword(password, user.password);
        if (!match)
          throw { name: "INVALID_DATA", message: "invalid email/password" };
        const access_token = generateToken({
          id: user.id,
          username: user.username,
          email: user.email,
          pictureUrl: user.pictureUrl,
          eloRating: user.eloRating,
        });
        res.status(200).json({
          access_token: access_token,
          id: user.id,
          username: user.username,
          email: user.email,
          pictureUrl: user.pictureUrl,
          eloRating: user.eloRating,
        });
      })
      .catch((err) => next(err));
  }
  static getLeaderboard(req, res, next) {
    const { testError } = req.body;
    if (testError) throw { name: "INVALID_DATA", message: "TEST ERROR" };
    User.findAll()
      .then((users) => res.status(200).json(users))
      .catch((err) => {
        next(err);
      });
  }
  static googleLogin(req, res, next) {
    const { googleId, imageUrl, email, name } = req.body;
    User.findOne({
      where: {
        email,
      },
    })
      .then((user) => {
        if (user) {
          const access_token = generateToken({
            id: user.id,
            username: user.username,
            email: user.email,
            pictureUrl: user.pictureUrl,
            eloRating: user.eloRating,
          });
          console.log(access_token, "?????????????????????");
          res
            .status(200)
            .json({ username: user.username, email: user.email, access_token });
        } else {
          return User.create({
            username: name,
            email,
            password: "defaultPassword",
          }).then((registeredUser) => {
            console.log(registeredUser, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            const access_token = generateToken({
              id: registeredUser.id,
              username: registeredUser.username,
              email: registeredUser.email,
              pictureUrl: registeredUser.pictureUrl,
              eloRating: registeredUser.eloRating,
            });
            res
              .status(201)
              .json({
                username: registeredUser.username,
                email: registeredUser.email,
                access_token,
              });
          });
        }
      })
      .catch((err) => next(err));
  }
}

module.exports = UserController;
