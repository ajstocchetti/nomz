const React = require('react-native');
const postUrl = "http://localhost:1337/api/upload";
const Uploader = require('./image-upload');

const {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableHighlight,
  NativeModules,
  CameraRoll
} = React;

const reactImageProject = React.createClass({
  getInitialState() {
    return {
      images: [],
      selected: '',
    };
  },

  componentDidMount() {
    const fetchParams = {
      first: 25,
    };
    CameraRoll.getPhotos(fetchParams, this.storeImages, this.logImageError);
  },

  storeImages(data) {
    const assets = data.edges;
    const images = assets.map((asset) => asset.node.image);
    this.setState({
      images: images,
    });
  },

  logImageError(err) {
    console.log(err);
  },

  selectImage(uri) {
    console.log("URI: ", uri);
    this.props.navigator.push({
      title: 'Post a Pic',
      component: Uploader,
      backButtonTitle: ' ',
      passProps: { user: this.props.user, imgUri: uri }
    });

    // NativeModules.ReadImageData.readImageFull(uri, (image) => {
    //   this.setState({
    //     selected: image,
    //   });
    //
    //   fetch(postUrl, {
    //     method: 'POST',
    //     headers: {
    //       'Accept': 'application/json',
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ user: this.props.user, image: image })
    //   })
    //   // .then((res) => res.json())
    // });
    // console.log(uri);
  },

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.imageGrid}>
        { this.state.images.map((image) => {
          return (
            <TouchableHighlight onPress={this.selectImage.bind(null, image.uri)}>
            <Image style={styles.image} source={{ uri: image.uri }} />
            </TouchableHighlight>
          );
          })
        }
        </View>
      </ScrollView>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },

  imageGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  image: {
    width: 100,
    height: 100,
    margin: 10,
  }
});


// AppRegistry.registerComponent('reactImageProject', () => reactImageProject);
module.exports = reactImageProject;
