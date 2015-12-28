var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Image,
  Text,
  View,
  TouchableOpacity
} = React;
var Camera = require('react-native-camera');
var Button = require('../react-native-button');


var cameraApp = React.createClass({
  getInitialState() {
    return {
      cameraType: Camera.constants.Type.back
    }
  },

  render() {

    return (
      <Camera
        ref="cam"
        style={styles.container}
        onBarCodeRead={this._onBarCodeRead}
        type={this.state.cameraType}
      >
        <TouchableOpacity style={styles.bottomL} onPress={this._switchCamera}>
          <Image source={require('../../images/camera-rotate-icon.png')}/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomR} onPress={this._takePicture}>
          <Image source={require('../../images/camera-icon.png')}/>
        </TouchableOpacity>
      </Camera>
    );
  },
  _onBarCodeRead(e) {
    console.log(e);
  },
  _switchCamera() {
    var state = this.state;
    state.cameraType = state.cameraType === Camera.constants.Type.back
      ? Camera.constants.Type.front : Camera.constants.Type.back;
    this.setState(state);
  },
  _takePicture() {
    this.refs.cam.capture(function(err, data) {
      console.log(err, data);
    });
  }
});


var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  bottomL: {
    position: 'absolute',
    bottom: 25,
    left: 25
  },
  bottomR: {
    position: 'absolute',
    bottom: 25,
    right: 25
  },


  btn: {
    flexDirection: 'row',
    width: 300,
    fontSize: 20,
    color: 'white',
    padding: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: '#007aff'
  },
});

AppRegistry.registerComponent('cameraApp', () => cameraApp);
module.exports = cameraApp
