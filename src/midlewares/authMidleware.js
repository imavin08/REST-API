const jsonwebtoken = require("jsonwebtoken");
const Joi = require("joi");
const { ValidationError, NotAutorizedError } = require("../helpers/errors");
const { User } = require("../db/authModel");

const validToken = async (req, res, next) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const [tokenType, token] = req.headers.authorization.split(" ");

    if (!token || tokenType !== "Bearer") {
      return next(new NotAutorizedError("Not authorized"));
    }
    const user = jsonwebtoken.decode(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(user._id);
    if (!currentUser) {
      return next(new NotAutorizedError("Not authorized"));
    }
    return currentUser;
  } catch (error) {
    next(new NotAutorizedError("Not authorized"));
  }
};

module.exports = {
  signUpValidation: async (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    const validResult = schema.validate(req.body);
    if (validResult.error) {
      return next(new ValidationError(validResult.error.message));
    }

    next();
  },
  loginValidation: async (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const validResult = schema.validate(req.body);
    if (validResult.error) {
      return next(new ValidationError(validResult.error.message));
    }

    next();
  },
  tokenValidation: async (req, res, next) => {
    const currentUser = await validToken(req, res, next);
    req.user = currentUser;
    next();
  },
  logoutValidation: async (req, res, next) => {
    const currentUser = await validToken(req, res, next);
    if (!currentUser) {
      return;
    }
    await User.findOneAndUpdate(
      { _id: currentUser._id },
      {
        $set: { token: null },
      }
    );
    res.status(204).json({});
  },
  currentUserValidation: async (req, res, next) => {
    const currentUser = await validToken(req, res, next);
    if (!currentUser) {
      return;
    }
    res.status(200).json({
      email: currentUser.email,
      subscription: currentUser.subscription,
    });
  },
  subscriptionValidation: async (req, res, next) => {
    await validToken(req, res, next);
    const schema = Joi.object({
      subscription: Joi.string().valid("starter", "pro", "business").required(),
    });

    const validResult = schema.validate(req.body);
    if (validResult.error) {
      return next(new ValidationError(validResult.error.message));
    }
    next();
  },
};
