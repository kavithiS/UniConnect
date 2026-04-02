const PREFIX = 'IT100-';
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const buildCandidateCode = () => {
  const randomLetters = Array.from({ length: 3 }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]).join('');
  const randomDigits = Math.floor(100 + Math.random() * 900);
  return `${PREFIX}${randomLetters}${randomDigits}`;
};

const generateUniqueGroupCode = async (GroupModel) => {
  let code;
  let exists = true;
  while (exists) {
    code = buildCandidateCode();
    const existing = await GroupModel.findOne({ groupCode: code });
    exists = !!existing;
  }
  return code;
};

const ensureGroupCode = async (group, GroupModel) => {
  if (!group) return null;
  if (group.groupCode && group.groupCode.startsWith(PREFIX)) {
    return group.groupCode;
  }
  const code = await generateUniqueGroupCode(GroupModel);
  group.groupCode = code;
  await group.save();
  return code;
};

const normalizeAllGroupCodes = async (GroupModel) => {
  const groups = await GroupModel.find();
  await Promise.all(groups.map(group => ensureGroupCode(group, GroupModel)));
};

module.exports = {
  PREFIX,
  generateUniqueGroupCode,
  ensureGroupCode,
  normalizeAllGroupCodes
};
