import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { subscribeToTimer } from './socket';

export default class App extends React.Component {

  state = {
    timestamp: 'no timestamp yet'
  }

  constructor(props) {
    super(props)

    subscribeToTimer((err, timestamp) => this.setState({
      timestamp
    }))
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>{ this.state.timestamp }</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
