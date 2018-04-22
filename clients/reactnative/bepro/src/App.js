/**
 * @flow
 */

import React from 'react';
import { Button, Platform, View, Text } from 'react-native';
import { StackNavigator, TabNavigator, TabBarBottom } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';

import GlassesScreen from './screens/Glasses'
import CameraScreen from './screens/Camera'
import GalleryScreen from './screens/Gallery'

const TabNav = TabNavigator(
  {
    Home: {
      screen: CameraScreen,
      navigationOptions: {
        title: 'Camera',
      },
    },
    Settings: { screen: GlassesScreen },
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {  // eslint-disable-line react/prop-types
        const { routeName } = navigation.state;
        let iconName;
        if (routeName === 'Home') {
          iconName = `ios-information-circle${focused ? '' : '-outline'}`;
        } else if (routeName === 'Settings') {
          iconName = `ios-options${focused ? '' : '-outline'}`;
        }

        return <Ionicons name={iconName} size={25} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    },
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnabled: false,
  }
);

const AppNavigator = StackNavigator(
  {
    Index: {
      screen: TabNav,
    },
    Gallery: {
      screen: GalleryScreen,
      navigationOptions: {
        title: 'Gallery',
      },
    },
//     Profile: {
//       screen: ProfileScreen,
//       path: '/people/:name',
//       navigationOptions: ({ navigation }) => {
//         title: `${navigation.state.params.name}'s Profile!`;
//       },
//     },
  },
  {
    initialRouteName: 'Index',
    headerMode: 'none',

    /*
     * Use modal on iOS because the card mode comes from the right
     */
    mode: Platform.OS === 'ios' ? 'modal' : 'card',
  }
);

export default () => <AppNavigator persistenceKey="NavState" />;

// export default class App extends React.Component {
//   render() {
//     return <AppNavigator />;
//   }
// };