import User from "../models/userModule.js";

// ==================== UPDATE USER STATUS ====================

export const updateUserStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const { status } = req.body;

        // Validate status
        const validStatuses = ["online", "offline", "away", "busy"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be one of: online, offline, away, busy"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update status
        user.status = status;
        user.lastSeen = new Date();
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: {
                status: user.status,
                lastSeen: user.lastSeen
            }
        });

    } catch (error) {
        console.error("Update status error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating status"
        });
    }
};

export default { updateUserStatus };
