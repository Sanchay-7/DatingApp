export const calculateCompatibility = (user, candidate) => {
  let score = 0;

  if (candidate.relationshipIntent === user.relationshipIntent) score += 2;
  if (candidate.sexualOrientation === user.sexualOrientation) score += 1;

  // Shared interests give +0.5 per match
  const commonInterests = candidate.interests.filter(i =>
    user.interests.includes(i)
  );
  score += commonInterests.length * 0.5;

  // (Optional) If both liked each other before — extra score
  if (candidate.likedUsers?.includes(user.id)) score += 1.5;

  return score;
};
