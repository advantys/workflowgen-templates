import React from 'react';
import { View } from 'react-native';

import { ContainerStyle as style } from './styles';

export default function (props) {
  const styles = [style.container];

  if (props.style instanceof Array) {
    styles.unshift(...props.style);
  } else if (props.style) {
    styles.unshift(props.style);
  }

  return (
    <View style={styles}>
      {props.children}
    </View>
  );
}
