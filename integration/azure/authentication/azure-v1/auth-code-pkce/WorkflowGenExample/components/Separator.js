import React from 'react';
import { View } from 'react-native';

export default props => (
  <View
    style={{
      height: 1,
      backgroundColor: props.backgroundColor || 'lightgray'
    }} />
);
