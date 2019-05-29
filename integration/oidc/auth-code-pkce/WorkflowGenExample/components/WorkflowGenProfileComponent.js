import React, { Component } from 'react';
import {
  ActivityIndicator,
  Text,
  Button,
  SectionList,
  View
} from 'react-native';
import gql from 'graphql-tag';
import { Query, withApollo } from 'react-apollo';

import { CommonStyles } from './styles';
import { Container, Separator } from '.';

const GET_VIEWER_INFO = gql`
query {
  viewer {
    userName
    firstName
    lastName
    defaultLanguage
  }
}
`;

class WorkflowGenProfileComponent extends Component {
  constructor (props) {
    super(props);

    this.renderListBody = this.renderListBody.bind(this);
    this.renderListSectionHeader = this.renderListSectionHeader.bind(this);
  }

  render () {
    return (
      <Query query={GET_VIEWER_INFO}>
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return (
              <Container style={CommonStyles.centerContent}>
                <ActivityIndicator size='large' color='#2095F3' />
              </Container>
            );
          }

          if (error) {
            return (
              <Container style={{ flexDirection: 'column' }}>
                <Container style={[{ padding: 25 }, CommonStyles.centerContent]}>
                  <Text>{error.message}</Text>
                </Container>
                <Container style={[{ padding: 25 }, CommonStyles.centerContent]}>
                  <Button title='Retry' onPress={() => refetch()} />
                </Container>
              </Container>
            );
          }

          let keyCount = 0;
          const items = Object.entries(data.viewer)
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
                sections={[{ title: 'User Information', data: items }]}
                renderSectionHeader={this.renderListSectionHeader}
                renderItem={this.renderListBody} />
            </Container>
          );
        }}
      </Query>
    );
  }

  renderListBody ({ item }) {
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

  renderListSectionHeader ({ section: { title } }) {
    return (
      <View style={{ flex: 1, backgroundColor: 'lightgray', padding: 10 }}>
        <Text style={{ fontWeight: '900' }}>{title}</Text>
      </View>
    );
  }
}

export default withApollo(WorkflowGenProfileComponent);
