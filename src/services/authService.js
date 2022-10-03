const { v4: uuidv4 } = require("uuid");
const gravatar = require("gravatar");
const Jimp = require("jimp");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const { transporter } = require("../helpers/nodeMailerConfig");
require("dotenv").config();

const {
  NotAutorizedError,
  RegistrationConflictError,
  WrongParametersError,
  ValidationError,
} = require("../helpers/errors");
const { User } = require("../db/authModel");

const {
  uploadPatch,
  donwloadPatch,
} = require("../midlewares/uploadMidlewares");

const sentEmail = (verificationToken) => {
  const emailOptions = {
    from: "imavin07@meta.ua",
    to: "imavin08@gmail.com",
    subject: "Сonfirm your email",
    text: `Please confirm your email, click on this link: http://localhost:3000/api/users/verify/${verificationToken}`,
  };
  transporter
    .sendMail(emailOptions)
    .then((info) => console.log(info))
    .catch((err) => console.log(err));
};

const registration = async (email, password) => {
  const dublicateUser = await User.findOne({ email });
  if (dublicateUser) {
    throw new RegistrationConflictError("Email in use");
  }
  const verificationToken = uuidv4();
  const user = new User({
    verificationToken,
    email,
    password,
    avatarURL: gravatar.url(email),
  });
  await user.save();
  sentEmail(verificationToken);
};

const verification = async (verificationToken) => {
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw new WrongParametersError("User not found");
  }
  user.verificationToken = "null";
  user.verify = true;
  await user.save();
  return user;
};

const repeatVerify = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new WrongParametersError("User not found");
  }
  if (user.verify === true) {
    throw new ValidationError("Verification has already been passed");
  }
  sentEmail(user.verificationToken);
};

const login = async (email, password) => {
  const user = await User.findOne({ email, verify: true });
  if (!user) {
    throw new NotAutorizedError("Email or password is wrong");
  }
  if (!(await bcrypt.compare(password, user.password))) {
    throw new NotAutorizedError("Email or password is wrong");
  }
  const token = jsonwebtoken.sign(
    {
      _id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET
  );
  await User.findByIdAndUpdate(user.id, {
    $set: { token },
  });
  return { token, user };
};

const changeSubscription = async (user, subscription) => {
  await User.findOneAndUpdate(
    { _id: user._id },
    {
      $set: { subscription: subscription },
    }
  );
};

const changeAvatar = async (_id, file) => {
  Jimp.read(`${uploadPatch}/${file.filename}`)
    .then((avatar) => {
      return avatar.resize(250, 250).write(`${donwloadPatch}/${file.filename}`);
    })
    .catch((err) => {
      console.error(err);
    });
  const avatarURL = `http://localhost:${process.env.PORT}/avatars/${file.filename}`;
  await User.findOneAndUpdate(
    { _id },
    {
      $set: { avatarURL },
    }
  );
  return avatarURL;
};

module.exports = {
  registration,
  login,
  changeSubscription,
  changeAvatar,
  verification,
  repeatVerify,
};
