import React from 'react';
import { PortableTextInput } from 'sanity';

// This is a wrapper component to handle state updates properly
export const CustomPortableText = (props: any) => {
  // Use React.memo to prevent unnecessary re-renders
  return React.useMemo(() => {
    // @ts-ignore - React 19 type mismatch workaround
    return <PortableTextInput {...props} />;
  }, [props]);
};
