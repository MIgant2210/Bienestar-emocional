import React from 'react';
import AngieAvatar from './AngieAvatar';
import KennyAvatar from './KennyAvatar';

export const EquilibriaCharacter = ({
  character = 'angie',
  pose = 'neutral',
  duration = 4,
  compact = false
}) => {
  const isAngie = character === 'angie' || character === 'female';

  return isAngie ? (
    <AngieAvatar compact={compact} pose={pose} duration={duration} />
  ) : (
    <KennyAvatar compact={compact} pose={pose} duration={duration} />
  );
};

export default EquilibriaCharacter;

