import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  SectionList
} from 'react-native';

import { Container, Separator } from '.';

class HomeComponent extends Component {
  constructor (props) {
    super(props);

    this.renderBody = this.renderBody.bind(this);
    this.renderSectionHeader = this.renderSectionHeader.bind(this);
  }

  render () {
    let keyCount = 0;
    const list = Object.entries(this.props.user)
      .map(([key, value]) => {
        const obj = {
          key: keyCount.toString(),
          name: key,
          value
        };

        keyCount++;
        return obj;
      });

    return (
      <Container>
        <SectionList
          renderItem={this.renderBody}
          renderSectionHeader={this.renderSectionHeader}
          sections={[
            { title: 'User Claims', data: list }
          ]} />
      </Container>
    );
  }

  renderSectionHeader ({ section: { title } }) {
    return (
      <View style={{ flex: 1, backgroundColor: 'lightgray', padding: 10 }}>
        <Text style={{ fontWeight: '900' }}>{title}</Text>
      </View>
    );
  }

  renderBody ({ item }) {
    return (
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ padding: 5, marginRight: 5, flexGrow: 1, flexShrink: 0 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
          </View>
          <View>
            <Text style={{ padding: 5, flexGrow: 3 }}>{item.value}</Text>
          </View>
        </View>
        <Separator />
      </View>
    );
  }
}

HomeComponent.propTypes = {
  user: PropTypes.object.isRequired
};

export default HomeComponent;
