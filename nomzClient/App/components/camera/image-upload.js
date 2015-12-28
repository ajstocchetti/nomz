const React = require('react-native');
const postUrl = "http://localhost:1337/api/upload";

const Button = require('../react-native-button');
const {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TextInput,
  TouchableHighlight,
  NativeModules,
} = React;

const photoUploader = React.createClass({
  getInitialState() {
    return {
      text: "",
    };
  },

  uploadImage() {
    let uri = this.props.imgUri;
    // console.log("URI: ", uri);
    NativeModules.ReadImageData.readImageFull(uri, (image) => {
      this.setState({
        selected: image,
      });

      fetch(postUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: this.props.user,
          image: image,
          caption: this.state.text
        })
      });

      this.props.navigator.replace({
          component: require('../home-screen'),
          passProps: { userId: this.props.user }
      })

    });
  },

  render() {
    return (
      <View style={styles.container}>
        <Image source={{ uri: "nomz" , isStatic: true }} style={styles.bgImg} />
        <View style={{ marginTop: 115, backgroundColor: 'transparent' }}></View>
        <Text style={styles.label}>{"Say something about this photo"}</Text>
        <TextInput
          style={styles.textBox}
          onChangeText={(text) => this.setState({text})}
          value={this.state.text}
        />
        <Button
          style={styles.btn}
          onPress={this.uploadImage}>
          {"Post!"}
        </Button>
      </View>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems:'center',
    backgroundColor: 'transparent',
  },
  bgImg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.9
  },

  btn: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    width: 300,
    fontSize: 20,
    color: 'white',
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: '#007aff'
  },

  label: {
    backgroundColor: 'transparent',
    fontSize: 20,
    color: 'white',
  },

  image: {
    width: 100,
    height: 100,
    margin: 10,
  },
  textBox: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: 'white',
    margin: 15
  }
});

module.exports = photoUploader;
