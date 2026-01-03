import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-z0-9_]+$/,
        "Username can only contain lowercase letters, numbers, and underscores",
      ],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    profilePicture: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      maxlength: [200, "Bio cannot exceed 200 characters"],
      default: "",
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      maxlength: [100, "Location cannot exceed 100 characters"],
      default: "",
      trim: true,
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    publicKey: {
      type: String,
      default: null,
    },

    devices: [
      {
        deviceId: {
          type: String,
          required: true,
        },
        deviceName: {
          type: String,
          default: "Unknown Device",
        },
        fingerprint: {
          type: String,
        },
        lastSeen: {
          type: Date,
          default: Date.now,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    status: {
      type: String,
      enum: ["online", "offline", "away", "busy"],
      default: "offline",
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    blockedReason: {
      type: String,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ status: 1 });
userSchema.index({ isActive: 1 });

userSchema.virtual("profile").get(function () {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    profilePicture: this.profilePicture,
    bio: this.bio,
    status: this.status,
    lastSeen: this.lastSeen,
  };
});

userSchema.methods.hasDevice = function (deviceId) {
  return this.devices.some(
    (device) => device.deviceId === deviceId && device.isActive
  );
};
userSchema.methods.addDevice = function (deviceId, deviceName, fingerprint) {
  const existingDevice = this.devices.find((d) => d.deviceId === deviceId);

  if (existingDevice) {
    existingDevice.lastSeen = Date.now();
    existingDevice.isActive = true;
  } else {
    this.devices.push({
      deviceId,
      deviceName: deviceName || "Unknown Device",
      fingerprint,
      lastSeen: Date.now(),
      isActive: true,
    });
  }

  return this.save();
};

userSchema.methods.removeDevice = function (deviceId) {
  this.devices = this.devices.filter((device) => device.deviceId !== deviceId);
  return this.save();
};

userSchema.methods.getActiveDevicesCount = function () {
  return this.devices.filter((device) => device.isActive).length;
};

const User = mongoose.model("User", userSchema);

export default User;
