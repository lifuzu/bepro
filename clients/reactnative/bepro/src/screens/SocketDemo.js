import React from 'react';
import { Animated, Button, Dimensions, PanResponder, PixelRatio, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

import { subscribeToTimer, scanToWechat } from './socket';

import { Camera, Permissions, FileSystem, Constants, takeSnapshotAsync } from 'expo';

// const { screenHeight, screenWidth} = Dimensions.get('window');

const remote = 'https://i.pinimg.com/originals/33/2c/2f/332c2f5e1e339a19c5a24979a0582c76.png'
// 'https://cdn.pixabay.com/photo/2014/04/03/09/59/head-309540_960_720.png'
// 'http://tupian.aladd.net/2017/9/9.30/qinglvtouxiangtupian.jpg';
const obj = 'http://www.pngmart.com/files/1/Glasses-PNG-Clipart.png'
const text = ''
// 'This is some text inlaid in an <Image />';

const VIEWSNAPS_DIR = FileSystem.documentDirectory + 'images/'

export const timestamp = (presision=1) => Math.round((new Date()).getTime() / presision);

const ensureDirAsync = async (dir, intermediates=true) => {
    const props =  await FileSystem.getInfoAsync(dir)
    if( props.exists && props.isDirectory){
      return props;
    }
    await FileSystem.makeDirectoryAsync(dir, {intermediates})
    return await ensureDirAsync(dir, intermediates)
}

const snapViewAsync =  async (view, format='png') => {
    const dir = await ensureDirAsync(VIEWSNAPS_DIR);
    const snapshot = `${dir.uri}${timestamp()}.${format}`;
    const temp = await takeSnapshotAsync(view, {format, quality:1, result:'file'})
    await FileSystem.moveAsync({from:temp, to:snapshot});
    const info =  await FileSystem.getInfoAsync(snapshot, {md5:true})
    const type = `image/${format}`;
    return { ...info, type};
}

export default class App extends React.Component {

  view = null;

  state = {
    timestamp: 'no timestamp yet',
    loginUrl: 'no login url yet',

    hasCameraPermission: null,
    type: 'front',
  }

  constructor(props) {
    super(props)

    subscribeToTimer((err, timestamp) => this.setState({
      timestamp
    }))

    scanToWechat((err, loginUrl) => this.setState({
      loginUrl
    }))

    this.state = {
      pan: new Animated.ValueXY(),
      panValue: 0,
      borderWidth: 1
    };
  }

  async componentWillMount() {
    // Add a listener for the delta value change
    // this._val = { x:0, y:0 }
    // this.state.pan.addListener((value) => this._val = value);

    // Initialize PanResponder with move handling
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e) => true,
      onPanResponderMove: Animated.event([
        null, { dx: this.state.pan.x, dy: this.state.pan.y }
      ]),
      onPanResponderGrant: (evt) => {
        // adjusting delta value
        this.state.pan.setOffset(this.state.pan.__getValue());
        this.state.pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderRelease: (e, {vx, vy}) => {
        this.state.pan.flattenOffset()
      }
    });

    // Initialize image with actual size
    // Image.getSize(obj, (width, height) => {this.setState({width: screenWidth, height: height/width*screenWidth})});

    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  onLayout = (e) => {

    this.setState({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
      x: e.nativeEvent.layout.x,
      y: e.nativeEvent.layout.y
    })
  }

  onPressButtonDecrease = () => {

    this.setState({
      width: this.state.width - 10
    })
  }

  onPressButtonIncrease = () => {

    this.setState({
      width: this.state.width + 10
    })
  }

  onPressButtonBorderWidth = () => {

    this.setState({
      borderWidth: this.state.borderWidth === 1 ? 0 : 1
    })
  }

  onPressButtonSnapshot = async () => {

    const snapshot = await snapViewAsync(this.view)
    console.log(snapshot) // eslint-disable-line  no-undef
  }

  render() {
    const resizeMode = 'center'

    const panStyle = {
      transform: this.state.pan.getTranslateTransform()
    }

    return (
      <View ref={view => this.view = view}
        style={{
          flex: 1,
          backgroundColor: '#eee',
        }}
      >
        <Camera style={{ flex: 1 }} type={this.state.type}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              style={{
                flex: 0.5,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingTop: Constants.statusBarHeight / 2,
              }}
              onPress={() => {
                this.setState({
                  type: this.state.type === Camera.Constants.Type.back
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back,
                });
              }}>
              <Text
                style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                {' '}Flip{' '}
              </Text>
            </TouchableOpacity>
          </View>
        </Camera>

        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <Image
            style={{
              flex: 1,
              resizeMode,
            }}
            source={{ uri: remote }}
          />
          <Button
            onPress={this.onPressButtonDecrease}
            title="Decrease"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
          />
          <Button
            onPress={this.onPressButtonIncrease}
            title="Increase"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
          />
          <Button
            onPress={this.onPressButtonBorderWidth}
            title="Toggle"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
          />
          <Button
            onPress={this.onPressButtonSnapshot}
            title="Snap"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
          />
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontSize: 40,
            }}
          >
            {text}
          </Text>

        </View>

        <Animated.View
          onLayout={this.onLayout}
          {...this.panResponder.panHandlers}
          style={[panStyle, {

            width: this.state.width ? this.state.width : '100%',
            height: this.state.width / 2,
          }]}
          >
          <Image
            style={{
              flex: 1,
              borderWidth: this.state.borderWidth,
              height: 20,
              resizeMode: 'contain',
            }}
            source={{ uri: obj }}
          />

        </Animated.View>

      </View>
    );
  }
}

let CIRCLE_RADIUS = 30;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10
  },
  circle: {
    backgroundColor: "skyblue",
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS
  }
});