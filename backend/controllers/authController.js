import User from "../models/userModule.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const checkServer = async (req, res) => {
    return res.status(200).json({ message: "API is working" });
};

export const register = async (req, res) => {
    try {
        const { name, username, email, password, deviceId, deviceName, fingerprint } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, username, email, and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({
                    success: false,
                    message: "Email already registered"
                });
            }
            if (existingUser.username === username) {
                return res.status(400).json({
                    success: false,
                    message: "Username already taken"
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            username: username.toLowerCase(),
            email,
            password: hashedPassword,
            status: "online",  // Set status to online when registering
            lastSeen: new Date(),
            lastLogin: new Date(),
            devices: deviceId ? [{
                deviceId: deviceId || `device_${Date.now()}`,
                deviceName: deviceName || "Unknown Device",
                fingerprint: fingerprint || "",
                lastSeen: Date.now(),
                isActive: true
            }] : []
        });

        await newUser.save();

        const token = jwt.sign(
            { 
                userId: newUser._id,
                deviceId: deviceId || `device_${Date.now()}`
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const userResponse = {
            id: newUser._id,
            name: newUser.name,
            username: newUser.username,
            email: newUser.email,
            profilePicture: newUser.profilePicture,
            bio: newUser.bio,
            status: newUser.status,
            createdAt: newUser.createdAt
        };

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: userResponse
        });

    } catch (error) {
        console.error("Register error:", error);
        
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages[0] || "Validation failed"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        // Update user status to online and lastSeen
        user.status = "online";
        user.lastSeen = new Date();
        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
            { 
                userId: user._id,
                deviceId: req.body.deviceId || `device_${Date.now()}`
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const userResponse = {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            status: user.status,
            createdAt: user.createdAt
        };

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            user: userResponse
        });

    } catch (error) {
        console.error("Login error:", error);
        
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages[0] || "Validation failed"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};

export const logout = async (req, res) => {
    try {
        const { deviceId } = req.body;

        if (!deviceId) {
            return res.status(400).json({
                success: false,
                message: "Device ID is required"
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.devices = user.devices.filter(device => device.deviceId !== deviceId);

        // If no active devices remain, set status to offline
        const hasActiveDevices = user.devices.some(device => device.isActive);
        if (!hasActiveDevices) {
            user.status = "offline";
            user.lastSeen = new Date();
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (error) {
        console.error("Logout error:", error);
        
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages[0] || "Validation failed"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error during logout"
        });
    }
};