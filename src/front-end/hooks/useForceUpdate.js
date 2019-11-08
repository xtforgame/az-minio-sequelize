import { useState, useCallback } from 'react';

export default () => {
  const [, updateState] = useState();
  return useCallback(() => updateState({}), []);
};
