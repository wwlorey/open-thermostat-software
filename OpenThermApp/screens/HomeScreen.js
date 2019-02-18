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

const TEMP_SET_STATES = Object.freeze({ PRE: 1, IN_PROGRESS: 2, POST: 3 });
const DEFAULT_TEMPERATURE = 69;
const NOTIFICATION_TIMEOUT = 3;

// Blynk server communication example
fetch('http://45.32.59.202:8080/31a9ac8830f54853bcd7f4d01e17a0fd/isAppConnected').then(response => console.log(response)).catch(error => console.log(error));
fetch('http://45.32.59.202:8080/31a9ac8830f54853bcd7f4d01e17a0fd/update/V0?value=heck').then(response => console.log(response)).catch(error => console.log(error));

function TemperatureLabel({ labelType }) {
  return (
    <Text style={styles.temperatureLabelText}>{(labelType == 'set') ? 'Temperature will be set to' : 'Current Temperature'}</Text>
  );
}

function Temperature({ value }) {
  return (
    <View style={styles.temperatureContainer}>
      <Text style={styles.temperatureText}>{value}</Text>
      <Text style={styles.temperatureUnit}>°F</Text>
    </View>
  );
}

function BetterButton({ buttonText, handlePress }) {
  return (
    <TouchableHighlight onPress={handlePress} underlayColor="white">
      <View style={styles.button}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </View>
    </TouchableHighlight>
  );
}

function SetTempTimerNotification({ tempValue, tempVisible, timerValue }) {
  return (
    (tempVisible && timerValue > 0) ? 
    <View style={styles.setTempContainer}>
      <Text style={styles.setTempText}>Temperature set point: {tempValue}</Text> 
      <Text style={styles.setTempText}>will take effect in {timerValue} hours</Text> 
    </View> : tempVisible ?
    <View style={styles.setTempContainer}>
      <Text style={styles.setTempText}>Temperature set point: {tempValue}</Text> 
    </View> :
    <></>
  );
}

class TimerSlider extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: this.props.beginningValue };
    this.props.passUpValue(this.state.value);
  }

  handleValueChange(value) {
    this.setState({ value });
    this.props.passUpValue(this.state.value);
  }

  render() {
    return (
      <View style={styles.sliderContainer}>
        <Slider
          value={this.state.value}
          onValueChange={value => this.setState({ value })}
          onSlidingComplete={this.handleValueChange.bind(this)}
          minimumValue={0}
          maximumValue={12}
          step={0.5}
        />
        <Text style={styles.sliderText}>Temperature won't take effect for <Text style={{fontWeight: "bold"}}>{this.state.value}</Text> hours.</Text>
      </View>
    );
  }
}

class IncDecButton extends React.Component {
  handlePress = () => {
    this.props.passUpChange(this.props.displayChar)
  }

  render() {
    return (
      <TouchableHighlight onPress={this.handlePress} underlayColor="white">  
        <View style={this.props.viewStyle}>
          <Text style={styles.incDecText}>{this.props.displayChar}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}

class Notification extends React.Component {
  state = {
    visible: true
  }

  render() {
    return (
      this.state.visible ? (
        <Text style={styles.notificationText}>{this.props.text}</Text>
      ) : null
    );
  }
}

class ControlVerbage extends React.Component {
  state = {
    tempSetState: TEMP_SET_STATES.PRE,
    notificationVisible: true,
    timerVisible: false,
    tempValue: DEFAULT_TEMPERATURE,
    timerChanged: false,
  };

  handleTempSetPress = () => {
    this.setState({ tempSetState: TEMP_SET_STATES.IN_PROGRESS, notificationVisible: true });

    // Ensure residual notification timeout is cleared
    clearTimeout(this.notificationTimeoutHandle);
    this.props.startTempSetProcess();
  };

  handleDonePress = () => {
    this.setState({ tempSetState: TEMP_SET_STATES.POST, timerVisible: false });

    if (!this.state.timerChanged) {
      // Clear any timer that may exist
      this.handleTimerSliderChange(0);
    }
    else {
      // Reset for future temperature changes
      this.setState({ timerChanged: false });
    }

    this.beginNotificationDeath();
    this.props.endTempSetProcess();
  };
  
  handleTimerPress = () => {
    this.setState({ timerVisible: true });
  };
  
  handleTimerSliderChange= (time) => {
    this.props.passUpTimerValue(time);
    this.setState({ timerChanged: true });
  };

  beginNotificationDeath = () => {
    // Stop displaying notification after NOTIFICATION_TIMEOUT seconds
    this.notificationTimeoutHandle = setTimeout(() => {
      this.setState({ notificationVisible: false });
    }, NOTIFICATION_TIMEOUT * 1000);
  }

  updateNewTempValue = (type) => {
    tempValue = this.state.tempValue + (type == '-' ? -1 : 1);

    this.props.passUpTempValue(tempValue);
    this.setState({ tempValue });
  }

  render() {
    const { tempSetState } = this.state;
    const { notificationVisible } = this.state;

    return (
      <View style={styles.controlVerbage}>
        {tempSetState === TEMP_SET_STATES.PRE ? (
          <BetterButton
            buttonText="Set Temperature"
            handlePress={this.handleTempSetPress}
          />
        ) : tempSetState === TEMP_SET_STATES.IN_PROGRESS && !this.state.timerVisible ? (
          <>
            <View style={styles.incDecButtonContainer}>
              <IncDecButton passUpChange={this.updateNewTempValue} viewStyle={styles.incDecButton} displayChar='-' />
              <IncDecButton passUpChange={this.updateNewTempValue} viewStyle={styles.incDecButton}  displayChar='+' />
            </View>
            <BetterButton
              buttonText="Done"
              handlePress={this.handleDonePress}
            />
            <BetterButton
              buttonText="Use a timer"
              handlePress={this.handleTimerPress}
            />
          </>
        ) : tempSetState === TEMP_SET_STATES.IN_PROGRESS && this.state.timerVisible ? (
          <>
            <View style={styles.incDecButtonContainer}>
              <IncDecButton passUpChange={this.updateNewTempValue} viewStyle={styles.incDecButton} displayChar='-' />
              <IncDecButton passUpChange={this.updateNewTempValue} viewStyle={styles.incDecButton}  displayChar='+' />
            </View>
            <BetterButton
              buttonText="Done"
              handlePress={this.handleDonePress}
            />
            <TimerSlider 
              beginningValue={0.5}
              passUpValue={this.handleTimerSliderChange}
            />
          </>
        ) : tempSetState == TEMP_SET_STATES.POST && notificationVisible ? (
          <>
            <BetterButton
              buttonText="Set Temperature"
              handlePress={this.handleTempSetPress}
            />
            <Notification text="Temperature set!" />
          </>
        ) : (
          <>
            <BetterButton
              buttonText="Set Temperature"
              handlePress={this.handleTempSetPress}
            />
          </>
        )}
      </View>
    );
  }
}

export default class HomeScreen extends React.Component {
  state = {
    tempState: 'current',
    showSetTemp: false,
    actualTemp: DEFAULT_TEMPERATURE,
    setTemp: DEFAULT_TEMPERATURE,
    displayTemp: DEFAULT_TEMPERATURE,
    initTimerValue: 0,
  };

  static navigationOptions = { header: null };

  updateTemperatureValue = (newTemp) => {
    this.setState({ setTemp: newTemp, displayTemp: newTemp });
  }
  
  updateTimerValue = (initTimerValue) => {
    this.setState({ initTimerValue });
  }

  startTempSetProcess = () => {
    this.setState({ tempState: 'set', showSetTemp: false, displayTemp: this.state.setTemp });
  }

  endTempSetProcess = () => {
    if (this.state.actualTemp == this.state.setTemp) {
      this.setState({ showSetTemp: false });
    }
    else {
      this.setState({ showSetTemp: true });
    }

    this.setState({ tempState: 'current', displayTemp: this.state.actualTemp });
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          scrollEnabled={false}
        >
          <View style={styles.header}>
            <TemperatureLabel labelType={this.state.tempState} />
            <Temperature value={this.state.displayTemp} />
          </View>

          <View style={styles.controlBody}>
            <ControlVerbage startTempSetProcess={this.startTempSetProcess} 
              endTempSetProcess={this.endTempSetProcess} 
              passUpTempValue={this.updateTemperatureValue} 
              passUpTimerValue={this.updateTimerValue}
            />
            <SetTempTimerNotification 
              tempValue={this.state.setTemp} 
              tempVisible={this.state.showSetTemp} 
              timerValue={this.state.initTimerValue}
            />
            <View style={styles.controlBackground} />
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
  temperatureLabelText: {
    marginTop: 40,
    fontSize: 25,
  },
  temperatureContainer: {
    marginTop: 0,
    marginBottom: 10,
    flexDirection: 'row',
  },
  temperatureText: {
    fontSize: 170,
  },
  temperatureUnit: {
    fontSize: 30,
    marginTop: 45,
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
  setTempContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    zIndex: 1,
    padding: 5,
    bottom: -0.5 * Dimensions.get('window').height,
  },
  setTempText: {
    width: 250,
    backgroundColor: 'white',
    textAlign: 'center',
    fontSize: 20,
  },
  notificationText: {
    fontSize: 18,
    color: 'green',
  },
  incDecButtonContainer: {
    flex: 1,
    width: 300,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 30,
  },
  incDecButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0052a5',
    margin: 20,
    height: 70,
    width: 70,
    borderRadius: 70,
  },
  incDecText: {
    fontSize: 30,
    color: 'white',
    paddingBottom: 40,
  },
});
