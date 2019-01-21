import React from 'react';
import {
  Dimensions,
  ScrollView,
  Slider,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { WebBrowser } from 'expo';
import { MonoText } from '../components/StyledText';

class Temperature extends React.Component {
  constructor(props) {
    super(props);
    this.state = { temperature: 69 };
  }

  render() {
    return (
      <View style={styles.temperatureContainer}>
        <Text style={styles.temperatureText}>{this.state.temperature}</Text>
        <Text style={styles.temperatureUnit}>°F</Text>
      </View>
    );
  }
}

class SetTemperatureButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { visible: true };

    // You must "bind" functions in the constructor
    this._handlePress = this._handlePress.bind(this);
  }

  _handlePress() {
    this.setState({ visible: false }) 
  }

  render() {
    if (this.state.visible) {
      return (
        <TouchableHighlight onPress={this._handlePress} underlayColor="white">
          <View style={styles.button}>
            <Text style={styles.buttonText}>Set Temperature</Text>
          </View>
        </TouchableHighlight>
      );
    }

    return (
      null
    );
  }
}

class SliderExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: 0.2 };
  }
 
  render() {
    return (
      <View style={styles.sliderContainer}>
        <Slider
          value={this.state.value}
          onValueChange={(value) => this.setState({value})} />
        <Text>Value: {this.state.value}</Text>
      </View>
    );
  }
}

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} scrollEnabled={false}>

          <View style={styles.header}>
            <Temperature/>
          </View>

         <View style={styles.controlBody}>
            <View style={styles.controlVerbage}>
              <SetTemperatureButton/>

              <SliderExample/>

            </View>

            <View style={styles.controlBackground}></View>

          </View>

        </ScrollView>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 30,
  },
  header: {
    flex: 1,
    alignItems: 'center',
  },
  temperatureContainer: {
    paddingTop: 40,
    paddingBottom: 20,
    flexDirection: 'row', 
  },
  temperatureText: {
    fontSize: 170,
  },
  temperatureUnit: {
    fontSize: 30,
    paddingTop: 45,
  },
  controlBody: {
    flex: 1,
  },
  controlVerbage: {
    position: 'absolute',
    alignItems: 'center',
    width: Dimensions.get('window').width,
    zIndex: 1,
    paddingTop: 90,
  },
  controlBackground: {
    // Create an oval topped shape that fills the page
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    borderRadius: Dimensions.get('window').width / 2,
    borderTopColor: 'black',
    borderWidth: 1,
    backgroundColor: '#CEE2FF',
    transform: [{ scaleX: 2 }],
  },
  button: {
    marginBottom: 30,
    width: 220,
    alignItems: 'center',
    backgroundColor: '#003366',
    borderRadius: 220 / 14,
  },
  buttonText: {
    padding: 20,
    fontSize: 23,
    color: 'white',
  },
  sliderContainer: {
    flex: 1,
    width: 300,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
});
