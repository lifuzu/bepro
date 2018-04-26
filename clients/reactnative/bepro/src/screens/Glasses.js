import React from 'react';
import { Animated, Button, Dimensions, PanResponder, StyleSheet, Text, View, Image } from 'react-native';
import PropTypes from 'prop-types';
import { FileSystem, Constants, takeSnapshotAsync } from 'expo';

type TouchType = {
  pageX: number,
  pageY: number,
};

type EventType = {
  nativeEvent: {
      touches: Array<TouchType>,
  },
};

type ImageType = {
  source: any,
  width: number,
  height: number,
  title: ?string,
};

type TranslateType = {
  x: number,
  y: number,
};

type GestureState = {
  dx: number,
  dy: number,
  vx: number,
  vy: number,
};

type PropsType = {
  images: Array<ImageType>,
  imageIndex: number,
  isVisible: boolean,
  animation: 'none' | 'fade',
  onClose: () => {},
  renderFooter: () => {},
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const remote = 'https://i.pinimg.com/originals/33/2c/2f/332c2f5e1e339a19c5a24979a0582c76.png';
// 'https://cdn.pixabay.com/photo/2014/04/03/09/59/head-309540_960_720.png'
// 'http://tupian.aladd.net/2017/9/9.30/qinglvtouxiangtupian.jpg';
const obj = 'http://www.pngmart.com/files/1/Glasses-PNG-Clipart.png';

const VIEWSNAPS_DIR = FileSystem.documentDirectory + 'images/';
const BORDER_WIDTH = StyleSheet.hairlineWidth;
const IMAGE_HEIGHT = 20;
const SCALE_MAXIMUM = 5;
const SCALE_EPSILON = 0.01;
const SCALE_MULTIPLIER = 1.2;
const SCALE_MAX_MULTIPLIER = 3;
const FREEZE_SCROLL_DISTANCE = 15;

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

const generatePanHandlers = (onStart, onMove, onRelease): any =>
  PanResponder.create({
    onStartShouldSetPanResponder: (): boolean => true,
    onStartShouldSetPanResponderCapture: (): boolean => true,
    onMoveShouldSetPanResponder: (): boolean => true,
    onMoveShouldSetPanResponderCapture: (): boolean => true,
    onPanResponderGrant: onStart,
    onPanResponderMove: onMove,
    onPanResponderRelease: onRelease,
    onPanResponderTerminate: onRelease,
    onPanResponderTerminationRequest: (): void => {},
  });

const getScale = (currentDistance: number, initialDistance: number): number =>
  currentDistance / initialDistance * SCALE_MULTIPLIER;
const pow2abs = (a: number, b: number): number => Math.pow(Math.abs(a - b), 2);

function getItemLayout(data, index): any {
  return {
    length: screenWidth,
    offset: screenWidth * index,
    index,
  };
}

function getDistance(touches: Array<TouchType>): number {
  const [a, b] = touches;

  if (a == null || b == null) {
    return 0;
  }

  return Math.sqrt(pow2abs(a.pageX, b.pageX) + pow2abs(a.pageY, b.pageY));
}

function calculateInitialScale(
  imageWidth: number = 0,
  imageHeight: number = 0
): number {
  const screenRatio = screenHeight / screenWidth;
  const imageRatio = imageHeight / imageWidth;

  if (imageWidth > screenWidth || imageHeight > screenHeight) {
    if (screenRatio > imageRatio) {
      return screenWidth / imageWidth;
    }

    return screenHeight / imageHeight;
  }

  return 1;
}

function calculateInitalTranslate(
  imageWidth: number = 0,
  imageHeight: number = 0
): TranslateType {
  const getTranslate = (axis: string): number => {
    const imageSize = axis === 'x' ? imageWidth : imageHeight;
    const screenSize = axis === 'x' ? screenWidth : screenHeight;

    if (imageWidth >= imageHeight) {
        return (screenSize - imageSize) / 2;
    }

    return screenSize / 2 - imageSize / 2;
  };

  return {
    x: getTranslate('x'),
    y: getTranslate('y'),
  };
}

const scalesAreEqual = (scaleA: number, scaleB: number): boolean =>
  Math.abs(scaleA - scaleB) < SCALE_EPSILON;

const getInitalParams = ({
  width,
  height,
}: {
  width: number,
  height: number,
}): {
  scale: number,
  translate: TranslateType,
} => ({
  scale: calculateInitialScale(width, height),
  translate: calculateInitalTranslate(width, height),
});

export default class GlassesScreen extends React.Component {

  view = null;

  constructor(props) {
    super(props)

    this.state = {
      borderWidth: BORDER_WIDTH,

      imageScale: 1,
      imageTranslate: {x: 0, y: 0},
    };

    this.imageScaleValue = new Animated.Value(1);
    this.imageTranslateValue = new Animated.ValueXY();

    this.panResponder = generatePanHandlers(
      (event: EventType, gestureState: GestureState): void =>
        this.onGestureStart(event.nativeEvent, gestureState),
      (event: EventType, gestureState: GestureState): void =>
        this.onGestureMove(event.nativeEvent, gestureState),
      (event: EventType, gestureState: GestureState): void =>
        this.onGestureRelease(event.nativeEvent, gestureState)
    );
  }

  onGestureStart(event: EventType) {
    this.initialTouches = event.touches;
    this.currentTouchesNum = event.touches.length;
  }

  onGestureMove(event: EventType, gestureState: GestureState) {

    if (this.currentTouchesNum === 1 && event.touches.length === 2) {
      this.initialTouches = event.touches;
    }

    const {imageScale, imageTranslate} = this.state;
    const {touches} = event;
    const {x, y} = imageTranslate;
    const {dx, dy} = gestureState;
    const imageInitialScale = this.getInitialScale();
    const height = IMAGE_HEIGHT;

    // if (imageScale !== imageInitialScale) {
      this.imageTranslateValue.x.setValue(x + dx);
    // }

    // Do not allow to move image verticaly untill it fits to the screen
    // if (imageScale * height > screenHeight) {
      this.imageTranslateValue.y.setValue(y + dy);
    // }

    // if image not scaled and fits to the screen
    if (
      scalesAreEqual(imageScale, imageInitialScale) &&
      height * imageInitialScale < screenHeight
      ) {
      // const backgroundOpacity = Math.abs(
      //   dy * BACKGROUND_OPACITY_MULTIPLIER
      //   );

      this.imageTranslateValue.y.setValue(y + dy);
      // this.modalBackgroundOpacity.setValue(
      //   backgroundOpacity > 1 ? 1 : backgroundOpacity
      // );
    }

    const currentDistance = getDistance(touches);
    const initialDistance = getDistance(this.initialTouches);

    const scrollEnabled = Math.abs(dy) < FREEZE_SCROLL_DISTANCE;
    this.setState({scrollEnabled});

    if (!initialDistance) {
      return;
    }

    if (touches.length < 2) {
      return;
    }

    let nextScale = getScale(currentDistance, initialDistance) * imageScale;

    if (nextScale < imageInitialScale) {
      nextScale = imageInitialScale;
      this.setState({
        width: this.state.width - 10
      })
    } else if (nextScale > SCALE_MAXIMUM) {
      nextScale = SCALE_MAXIMUM;
      this.setState({
        width: this.state.width + 10
      })
    }

    this.imageScaleValue.setValue(nextScale);
    this.currentTouchesNum = event.touches.length;
  }

  onGestureRelease(event: EventType, gestureState: GestureState) {

    // this.state.pan.flattenOffset()

    const {imageScale} = this.state;

    let {_value: scale} = this.imageScaleValue;

    const {dx, dy, vy} = gestureState;
    const imageInitialScale = this.getInitialScale();
    const imageInitialTranslate = this.getInitialTranslate();

    // Position haven't changed, so it just tap
    if (event && !dx && !dy && scalesAreEqual(imageScale, scale)) {
      // Double tap timer is launced, its double tap

      if (this.doubleTapTimer) {
        clearTimeout(this.doubleTapTimer); // eslint-disable-line  no-undef
        this.doubleTapTimer = null;

        scale = scalesAreEqual(imageInitialScale, scale)
            ? scale * SCALE_MAX_MULTIPLIER
            : imageInitialScale;

        Animated.timing(this.imageScaleValue, {
            toValue: scale,
            duration: 300,
        }).start();

      } else {
          this.doubleTapTimer = setTimeout(() => { // eslint-disable-line  no-undef
              this.doubleTapTimer = null;
          }, 200);
      }
    }

    const {x, y} = this.calcultateNextTranslate(dx, dy, scale);
    const scrollEnabled =
      scale === this.getInitialScale() &&
      x === imageInitialTranslate.x &&
      y === imageInitialTranslate.y;

    Animated.parallel(
      [
        Animated.timing(this.imageTranslateValue.x, {
          toValue: x,
          duration: 100,
        }),
        Animated.timing(this.imageTranslateValue.y, {
          toValue: y,
          duration: 100,
        }),
      ].filter(Boolean)
    ).start();

    this.setState({
      imageScale: scale,
      imageTranslate: {x, y},
      scrollEnabled,
    });
  }

  getInitialScale(index: number): number {

    return 1;
  }

  getInitialTranslate(index: number): TranslateType {

    return 1;
  }

  calcultateNextTranslate(
      dx: number,
      dy: number,
      scale: number
  ): {x: number, y: number} {
      const {imageTranslate} = this.state;
      const {x, y} = imageTranslate;
      const {width, height} = [screenWidth, IMAGE_HEIGHT];
      const {imageInitialScale} = this.getInitialScale();

      const getTranslate = (axis: string): number => {
          const imageSize = axis === 'x' ? width : height;
          const screenSize = axis === 'x' ? screenWidth : screenHeight;
          const leftLimit = (scale * imageSize - imageSize) / 2;
          const rightLimit = screenSize - imageSize - leftLimit;

          let nextTranslate = axis === 'x' ? x + dx : y + dy;

          // Less than the screen
          if (screenSize > scale * imageSize) {
              if (width >= height) {
                  nextTranslate = (screenSize - imageSize) / 2;
              } else {
                  nextTranslate =
                      screenSize / 2 -
                      imageSize * (scale / imageInitialScale) / 2;
              }

              return nextTranslate;
          }

          if (nextTranslate > leftLimit) {
              nextTranslate = leftLimit;
          }

          if (nextTranslate < rightLimit) {
              nextTranslate = rightLimit;
          }

          return nextTranslate;
      };

      return {x: getTranslate('x'), y: getTranslate('y')};
  }

  onLayout = (e) => {

    this.setState({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
      x: e.nativeEvent.layout.x,
      y: e.nativeEvent.layout.y
    })
  }

  onPressButtonBorderWidth = () => {

    this.setState({
      borderWidth: this.state.borderWidth === BORDER_WIDTH ? 0 : BORDER_WIDTH
    })
  }

  onPressButtonSnapshot = async () => {

    const snapshot = await snapViewAsync(this.view)
    console.log(snapshot) // eslint-disable-line  no-undef
  }

  render() {
    const resizeMode = 'center'

    const panStyle = {
      transform: this.imageTranslateValue.getTranslateTransform() //this.state.pan.getTranslateTransform()
    }

    return (
      <View ref={view => this.view = view}
        style={{
          flex: 1,
          backgroundColor: '#eee',
        }}
      >
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
            source={{ uri: this.props.navigation.state.params.uri ? this.props.navigation.state.params.uri : remote }}
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

        <Animated.View
          onLayout={this.onLayout}
          {...this.panResponder.panHandlers}
          style={[panStyle, {
            borderWidth: this.state.borderWidth,
            width: this.state.width ? this.state.width : '100%',
            height: this.state.width / 2,
          }]}
          >
          <Image
            style={{
              flex: 1,
              height: IMAGE_HEIGHT,
              resizeMode: 'contain',
            }}
            source={{ uri: obj }}
          />

        </Animated.View>

      </View>
    );
  }
}

GlassesScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    state: PropTypes.shape({
      params: PropTypes.shape({
        uri: PropTypes.any,
      })
    })
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});