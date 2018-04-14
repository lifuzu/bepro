import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

import { subscribeToTimer, scanToWechat } from './socket';

export default class App extends React.Component {

  state = {
    timestamp: 'no timestamp yet',
    loginUrl: 'no login url yet'
  }

  constructor(props) {
    super(props)

    subscribeToTimer((err, timestamp) => this.setState({
      timestamp
    }))

    scanToWechat((err, loginUrl) => this.setState({
      loginUrl
    }))
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>{ this.state.timestamp }</Text>
        <Image
          style={{width: 150, height: 150}}
          source={{uri: this.state.loginUrl}}
        />
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
