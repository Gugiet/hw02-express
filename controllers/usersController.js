import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/usersModel.js";
import gravatar from "gravatar";
import {
  validateSignUp,
  validateLogin,
} from "../middlewares/validationMiddleware.js";

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

export { signUp, login, logout, getCurrentUser, updateAvatar };
