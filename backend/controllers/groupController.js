const Group = require("../models/Group");
const User = require("../models/User");
const {
  generateUniqueGroupCode,
  ensureGroupCode,
} = require("../utils/groupCode");

/**
 * Create a new group
 * POST /groups
 */
exports.createGroup = async (req, res) => {
  try {
    const { title, description, requiredSkills, memberLimit } = req.body;

    // Validation
    if (!title || !description || memberLimit === undefined) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and memberLimit are required",
      });
    }

    if (memberLimit < 1 || memberLimit > 100) {
      return res.status(400).json({
        success: false,
        message: "Member limit must be between 1 and 100",
      });
    }

    // Generate unique group code
    const groupCode = await generateUniqueGroupCode(Group);

    const newGroup = new Group({
      title,
      description,
      groupCode,
      requiredSkills: requiredSkills || [],
      memberLimit,
    });

    await newGroup.save();

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: newGroup,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors || {})
        .map((err) => err.message)
        .filter(Boolean);
      return res.status(400).json({
        success: false,
        message: messages.join(" "),
      });
    }
    console.error("❌ Create group error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating group: " + error.message,
      error: error.message,
    });
  }
};

/**
 * Get all groups
 * GET /groups
 */
exports.getAllGroups = async (req, res) => {
  try {
    const { includeArchived } = req.query;

    // Filter out archived groups by default
    const filter =
      includeArchived === "true" ? {} : { status: { $ne: "archived" } };

    const groups = await Group.find(filter).populate({
      path: "members",
      select: "name skills",
      options: { strictPopulate: false },
    });

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    console.error("Error fetching groups:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching groups",
      error: error.message,
    });
  }
};

/**
 * Get single group by ID
 * GET /groups/:id
 */
exports.getGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    let group = await Group.findById(id).populate({
      path: "members",
      select: "name skills",
      options: { strictPopulate: false },
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching group",
      error: error.message,
    });
  }
};

/**
 * Get groups for current user (where user is a member)
 * GET /groups/my/members
 */
exports.getMyMemberGroups = async (req, res) => {
  try {
    const groups = await Group.find({ 
      members: req.userId 
    }).populate({
      path: 'members',
      select: 'fullName name email skills faculty',
      options: { strictPopulate: false }
    });

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching member groups',
      error: error.message
    });
  }
};

/**
 * Get group by code
 * GET /groups/code/:code
 */
exports.getGroupByCode = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code || code.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Group code is required",
      });
    }

    const normalized = code.trim().toUpperCase();
    const possibleCodes = new Set([normalized]);
    if (normalized.startsWith("IT100-")) {
      possibleCodes.add(normalized.replace("IT100-", ""));
    } else {
      possibleCodes.add(`IT100-${normalized}`);
    }

    const group = await Group.findOne({
      groupCode: { $in: Array.from(possibleCodes) },
    }).populate({
      path: "members",
      select: "name skills",
      options: { strictPopulate: false },
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: `No group found with code: ${code.toUpperCase()}`,
      });
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching group by code",
      error: error.message,
    });
  }
};

/**
 * Update group
 * PUT /groups/:id
 */
exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requiredSkills, memberLimit, status } =
      req.body;

    // Find group first
    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Validate memberLimit if provided
    if (memberLimit !== undefined && (memberLimit < 1 || memberLimit > 100)) {
      return res.status(400).json({
        success: false,
        message: "Member limit must be between 1 and 100",
      });
    }

    // Update fields
    if (title) group.title = title;
    if (description) group.description = description;
    if (requiredSkills) group.requiredSkills = requiredSkills;
    if (memberLimit) group.memberLimit = memberLimit;
    if (status) group.status = status;

    await group.save();

    res.status(200).json({
      success: true,
      message: "Group updated successfully",
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating group",
      error: error.message,
    });
  }
};

/**
 * Archive group (soft delete)
 * DELETE /groups/:id
 */
exports.archiveGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findByIdAndUpdate(
      id,
      { status: "archived" },
      { new: true },
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Group archived successfully",
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error archiving group",
      error: error.message,
    });
  }
};

/**
 * Join a group
 * POST /groups/:id/join
 */
exports.joinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (group.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This group is not accepting new members",
      });
    }

    const alreadyMember = group.members.some(
      (memberId) => memberId.toString() === userId.toString(),
    );
    if (alreadyMember) {
      return res.status(200).json({
        success: true,
        message: "User is already a member of this group",
        data: group,
      });
    }

    if (group.members.length >= group.memberLimit) {
      return res.status(400).json({
        success: false,
        message: "Group member limit reached",
      });
    }

    group.members.push(userId);
    await group.save();

    const updatedGroup = await Group.findById(id).populate({
      path: "members",
      select: "name skills",
      options: { strictPopulate: false },
    });

    res.status(200).json({
      success: true,
      message: "Joined group successfully",
      data: updatedGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error joining group",
      error: error.message,
    });
  }
};
