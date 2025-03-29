import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as userModel from "../models/userModel.js";
import { obfuscateUserId } from "./helpers/obfuscation.js";
import sgMail from "@sendgrid/mail";
import { config } from "dotenv";

config();

// Set SendGrid API Key
const currentDomain = process.env.CURRENT_DOMAIN || "http://localhost:3000";
console.log("SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY); 
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await userModel.getUserByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  if( user.isDeleted ) {
    return res.status(401).json({ message: "Your Account is blocked" });
  }
  if (!user.isActivated) {
    return res.status(401).json({ message: "User is not activated" });
  }

  const obfuscatedUserId = obfuscateUserId(user.id);
  const token = jwt.sign(
    {
      id: obfuscatedUserId,
      username: user.username,
      isSuperUser: user.isSuperUser,
    },
    "fallingisflyingexceptwithamorepermanentdestination",
    {
      expiresIn: "1d",
    }
  );
  res.json({
    id: obfuscatedUserId,
    token,
    name: user.name,
    email: user.email,
    phone: user.phone_number,
    isSuperUser: user.isSuperUser,
    userDetails: {
      id: obfuscatedUserId,
      name: user.name,
      email: user.email,
      phone: user.phone_number,
      address: user.address,
      avatar: user.avatar,
    },
  });
};

const register = async (req, res) => {
  const { username, phone_number, password, email, name, address, avatar } =
    req.body;

  const userExists = await userModel.getUserByUsername(username);
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }
  
  const verificationToken = jwt.sign(
    { username },
    "email_verification_secret",
    {
      expiresIn: "1d",
    }
  );

  // Create the user but set isActivated to false
  const userId = await userModel.createUser({
    username,
    password,
    email,
    name,
    phone_number,
    address,
    avatar,
  });

  // Send verification email
  const verificationLink = `${currentDomain}/auth/verify-email?token=${verificationToken}`;
  const msg = {
    to: username,
    from: "anne@thebrassringcollective.com", // **VERIFIED** sender
    subject: "Verify your email",
    text: `Click the link to verify your email: ${verificationLink}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #4CAF50;">Welcome to The Brass Ring Collective!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for registering with us. Please click the button below to verify your email address:</p>
      <p style="text-align: center;">
        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      </p>
      <p>If the button above doesn't work, please copy and paste the following link into your web browser:</p>
      <p><a href="${verificationLink}" style="color: #4CAF50;">${verificationLink}</a></p>
      <p>Thank you,<br>The Teqie Team</p>
    </div>
  `,
  };

  try {
    await sgMail.send(msg);
    res
      .status(201)
      .json({
        message:
          "Registration successful. Please check your email to verify your account.",
      });
  } catch (error) {
    res.status(500).json({ message: "Error sending verification email." });
    console.log("Error sending verification email:", error);
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, "email_verification_secret");
    console.log("Decoded:", decoded);
    const user = await userModel.getUserByUsername(decoded.username);
    console.log("User:", user);
    if (!user || user.isActivated) {
      res.render('verificationAlreadyDone');
      return res.status(400).json({ message: "User not found / already active" });
    }

    // Activate user
    await userModel.activateUser(user.id);
    res.render('verificationSuccess'); // Render the EJS template

    // res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    res.render('verificationFailed'); // Render the EJS template for failure
    // res.status(400).json({ message: "Invalid or expired token." });
    console.log("Error verifying email:", error);
  }
};

const resendVerificationEmail = async (req, res) => {
  const { username } = req.body;

  const user = await userModel.getUserByUsername(username);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (user.isActivated) {
    return res.status(400).json({ message: "User is already activated" });
  }

  const verificationToken = jwt.sign(
    { username },
    "email_verification_secret",
    {
      expiresIn: "1d",
    }
  );

  // Send verification email
  const verificationLink = `${currentDomain}/auth/verify-email?token=${verificationToken}`;
  const msg = {
    to: username,
    from: "anne@thebrassringcollective.com", // **VERIFIED** sender
    subject: "Verify your email",
    text: `Click the link to verify your email: ${verificationLink}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #4CAF50;">Welcome to The Brass Ring Collective!</h2>
      <p>Hi ${username},</p>
      <p>Thank you for registering with us. Please click the button below to verify your email address:</p>
      <p style="text-align: center;">
        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      </p>
      <p>If the button above doesn't work, please copy and paste the following link into your web browser:</p>
      <p><a href="${verificationLink}" style="color: #4CAF50;">${verificationLink}</a></p>
      <p>Thank you,<br>The Teqie Team</p>
    </div>
  `,
  };

  try {
    await sgMail.send(msg);
    res.status(201).json({
      message:
        "Verification code resent. Please check your email to verify your account.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error sending verification email." });
    console.log("Error sending verification email:", error);
  }
};

export { login, register, verifyEmail, resendVerificationEmail };
