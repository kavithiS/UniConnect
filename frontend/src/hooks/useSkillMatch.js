import { useMemo } from 'react';

export const useSkillMatch = (userSkills, requiredSkills) => {
  const matchScore = useMemo(() => {
    if (!requiredSkills || requiredSkills.length === 0) return 100;

    const userSkillsLower = (userSkills || []).map(s => s.toLowerCase());
    const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());

    const matchedCount = requiredSkillsLower.filter(skill =>
      userSkillsLower.includes(skill)
    ).length;

    return Math.round((matchedCount / requiredSkillsLower.length) * 100);
  }, [userSkills, requiredSkills]);

  return matchScore;
};
