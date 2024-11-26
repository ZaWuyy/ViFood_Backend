
const express = require("express");
import userModel from "../models/userModel.js";
const { verifyToken } = require("../middleware/auth");   
const sendEmail = require("../utils/emailService");

// profile
const fectchProfile = async (req, res) => {
    try {
      const user = await userModel.findById(req.user.id).select("-password -resetPasswordToken -resetPasswordExpires");
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// update profile
const updateProfile = async (req, res) => {
    const { username, firstname, lastname, phoneNumber, avatarUrl } = req.body;
    try {
      const user = await userModel.findByIdAndUpdate(req.user.id, { username, firstname, lastname, phoneNumber, avatarUrl }, { new: true });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// send verification email
const sendVerificationEmail = async (req, res) => {
    const { newEmail } = req.body;
    const user = await userModel.findById(req.user.id);
  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    const verificationToken = user.generateVerificationToken();
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&email=${newEmail}`;
    user.emailVerificationToken = verificationToken;
    try {
      await user.save();
      await sendEmail(newEmail, "Email Verification", `Please verify your email by clicking the following link: ${verificationLink}`);
  
      res.json({ message: "Verification email sent" });
    } catch (error) {
      res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// verify email
const verifyEmail = async (req, res) => {
    const { token, email } = req.body;
  
    try {
      const user = await userModel.findOne({ emailVerificationToken: token });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid token" });
      }
  
      user.email = email;
      user.emailVerificationToken = undefined;
      await user.save();
  
      res.json({ message: "Email verified and updated" });
    } catch (error) {
      res.status(500).json({ message: `Server error: ${error.message}` });
    }
};
  

// Create a new user
const createUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "Email already exists" });
        }

        const newUser = new userModel({ username, email, password });
        await newUser.save();
        res.json({ success: true, message: "User created successfully", user: newUser });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error creating user" });
    }
};

// Update a user
const updateUser = async (req, res) => {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const { role } = req.body;
    try {
        const updatedUser = await userModel.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// Delete a user
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await userModel.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// Fetch a single user by ID
const getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await userModel.findById(id);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// Fetch a list of users with search and filter
const getUsers = async (req, res) => {
    const { search, role, gender } = req.query;
    const query = {};

    if (search) {
        query.$or = [
            { firstname: new RegExp(search, 'i') },
            { lastname: new RegExp(search, 'i') },
            { username: new RegExp(search, 'i') },
            { email: new RegExp(search, 'i') },
            { phoneNumber: new RegExp(search, 'i') },
        ];
    }

    if (role) {
        query.role = role;
    }

    if (gender) {
        query.gender = gender;
    }

    try {
        const users = await userModel.find(query);
        res.json({ success: true, users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

export default { createUser, updateUser, deleteUser, getUser, getUsers, fectchProfile, updateProfile, sendVerificationEmail, verifyEmail };

