import React from 'react';
import AngieAvatar from './AngieAvatar';
import KennyAvatar from './KennyAvatar';

export const HumanWellnessAvatar = ({
  character = 'female',
  pose = 'neutral',
  duration = 4,
  compact = false
}) => {
  const isAngie = character === 'female' || character === 'angie';

  return isAngie ? (
    <AngieAvatar compact={compact} pose={pose} duration={duration} />
  ) : (
    <KennyAvatar compact={compact} pose={pose} duration={duration} />
  );
};

export default HumanWellnessAvatar;
