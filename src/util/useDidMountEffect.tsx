import React, { useEffect, useRef } from 'react';

// For handling useEffect(..., []) but not running in the initial setup
const useDidMountEffect = (func: () => void, deps?: React.DependencyList | undefined) => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps);
}

export default useDidMountEffect;