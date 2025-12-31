import Chat from "../models/chatModel.js";
import User from "../models/userModule.js";

export const createChat = async (req, res) => {
    try {
        const { type, name, description, participants, groupKey, groupIcon } = req.body;
        const userId = req.userId;

        if (!type) {
            return res.status(400).json({
                success: false,
                message: "Chat type is required"
            });
        }

        if (!participants || participants.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Participants are required"
            });
        }

        if (!participants.includes(userId)) {
            participants.push(userId);
        }

        const users = await User.find({ _id: { $in: participants } });
        
        if (users.length !== participants.length) {
            return res.status(400).json({
                success: false,
                message: "One or more participants not found"
            });
        }

        if (type === "private") {
            if (participants.length !== 2) {
                return res.status(400).json({
                    success: false,
                    message: "Private chat must have exactly 2 participants"
                });
            }

            const existingChat = await Chat.findOne({
                type: "private",
                participants: { $all: participants, $size: 2 }
            });

            if (existingChat) {
                return res.status(200).json({
                    success: true,
                    message: "Chat already exists",
                    data: existingChat
                });
            }

            const newChat = new Chat({
                type: "private",
                participants,
                isActive: true
            });

            await newChat.save();

            const populatedChat = await Chat.findById(newChat._id)
                .populate("participants", "username email profilePicture status");

            return res.status(201).json({
                success: true,
                message: "Private chat created successfully",
                data: populatedChat
            });
        }

        if (type === "group") {
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: "Group name is required"
                });
            }

            if (!groupKey) {
                return res.status(400).json({
                    success: false,
                    message: "Group encryption key is required"
                });
            }

            if (participants.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "Group must have at least 2 participants"
                });
            }

            const newChat = new Chat({
                type: "group",
                name,
                description: description || "",
                participants,
                admin: userId,
                groupKey,
                groupIcon: groupIcon || null,
                isActive: true
            });

            await newChat.save();

            const populatedChat = await Chat.findById(newChat._id)
                .populate("participants", "username email profilePicture status")
                .populate("admin", "username email");

            return res.status(201).json({
                success: true,
                message: "Group chat created successfully",
                data: populatedChat
            });
        }

        return res.status(400).json({
            success: false,
            message: "Invalid chat type"
        });

    } catch (error) {
        console.error("Create chat error:", error);

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages[0] || "Validation failed"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error during chat creation"
        });
    }
};