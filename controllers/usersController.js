import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/usersModel.js";
import gravatar from "gravatar";
import {
  validateSignUp,
  validateLogin,
} from "../middlewares/validationMiddleware.js";

import { v4 as uuidv4 } from "uuid";
import mailgun from "mailgun-js";

import "dotenv/config";

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const signUp = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const signUpValidationResult = validateSignUp({ email, password });
    if (signUpValidationResult.error) {
      return res.status(400).json({
        message: "Validation error",
        details: signUpValidationResult.error.details,
      });
    }

    const avatarURL = gravatar.url(email, {
      s: "250",
      r: "pg",
      d: "identicon",
    });
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      avatarURL,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  const loginValidationResult = validateLogin({ email, password });
  if (loginValidationResult.error) {
    return res.status(400).json({
      message: "Validation error",
      details: loginValidationResult.error.details,
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    user.token = token;
    await user.save();

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const user = req.user;
    user.token = null;
    await user.save();

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    next(error);
  }
};
const updateAvatar = async (userId, filename) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatarURL: `/avatars/${filename}` },
      { new: true }
    );

    return updatedUser.avatarURL;
  } catch (error) {
    throw error;
  }
};

const verifyEmail = async (req, res, next) => {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.verify = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

const resendVerificationEmail = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Missing required field email" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    const verificationToken = uuidv4();
    user.verificationToken = verificationToken;
    await user.save();

    const data = {
      from: "your-email@example.com",
      to: email,
      subject: "Email Verification",
      text: `Click the following link to verify your email: http://localhost:3000//api/users/verify/${verificationToken}`,
    };

    mg.messages().send(data, (error, body) => {
      if (error) {
        console.error(error);
        return res
          .status(500)
          .json({ message: "Error sending verification email" });
      }

      res.status(200).json({ message: "Verification email sent" });
    });
  } catch (error) {
    next(error);
  }
};

export {
  signUp,
  login,
  logout,
  getCurrentUser,
  updateAvatar,
  verifyEmail,
  resendVerificationEmail,
};
