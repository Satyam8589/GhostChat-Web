import User from "../models/userModule.js";

export const userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userProfile = {
      _id: user._id,
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      status: user.status,
      publicKey: user.publicKey,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: userProfile,
    });
  } catch (error) {
    console.error("User profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during user profile retrieval",
    });
  }
};

export const search = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.userId;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: userId } },
        { isActive: true },
        {
          $or: [
            { username: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
      ],
    })
      .select("username email profilePicture bio status publicKey")
      .limit(20);

    return res.status(200).json({
      success: true,
      message: "Search results retrieved successfully",
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during search",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, username, email, profilePicture, bio, phone, location } =
      req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update name
    if (name !== undefined) {
      if (name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters",
        });
      }
      user.name = name.trim();
    }

    if (username && username !== user.username) {
      if (username.length < 3 || username.length > 30) {
        return res.status(400).json({
          success: false,
          message: "Username must be between 3 and 30 characters",
        });
      }

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }
      user.email = email;
      user.isEmailVerified = false;
    }

    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    if (bio !== undefined) {
      if (bio.length > 200) {
        return res.status(400).json({
          success: false,
          message: "Bio cannot exceed 200 characters",
        });
      }
      user.bio = bio;
    }

    // Update phone
    if (phone !== undefined) {
      if (phone && phone.trim().length > 0) {
        const phoneRegex =
          /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
        if (!phoneRegex.test(phone)) {
          return res.status(400).json({
            success: false,
            message: "Invalid phone number format",
          });
        }
      }
      user.phone = phone.trim();
    }

    // Update location
    if (location !== undefined) {
      if (location && location.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Location cannot exceed 100 characters",
        });
      }
      user.location = location.trim();
    }

    await user.save();

    const updatedProfile = {
      _id: user._id,
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: updatedProfile,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || "Validation failed",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during user profile update",
    });
  }
};
