// cite your sources:
// http://browniefed.com/blog/2015/06/06/react-native-tinder-like-cards/
// https://github.com/brentvatne/react-native-animated-demo-tinder/blob/master/index.ios.js

'use strict';
var React = require('react-native');

var Results = require('./game-results.js');
var Button = require('./react-native-button');
var Dimensions = require('Dimensions');
var windowSize = Dimensions.get('window');
var {
  Image,
  NavigatorIOS,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} = React;

// const GAME_DATA_URL = 'http://localhost:1337/api/game/nomzStorage';
// const GAME_DATA_URL = 'http://localhost:1337/api/game/start';
const GAME_DATA_URL = 'http://localhost:1337/api/game/safe';
const MIN_NUM_SWIPES = 20;

var Application = React.createClass({
  getInitialState: function() {
    return {
      loaded: false,
      connectError: false,
      imgAry: [],
      imgIndex: 0,
      currentImageUrl: "",
      answeredCount: 0,
      preferences: {
        tag: {},
        venue: {},
        count: 0
      },
      x: 0,
      y: 0,
      geoPosition: undefined,
      // not using Yes and No counts yet, but could be useful in the future
      Yes: 0,
      No: 0,
      opacity: 1
    }
  },

  componentDidMount: function() {
    navigator.geolocation.getCurrentPosition(
      (geoPosition) => {
        this.setState({geoPosition});
        this.fetchSourceData();
      },
      (error) => alert(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  },

  fetchSourceData: function() {
    var game_url = GAME_DATA_URL;
    if(this.state.geoPosition && this.state.geoPosition.coords) {
      game_url += "?lat=" + this.state.geoPosition.coords.latitude;
      game_url += "&long=" + this.state.geoPosition.coords.longitude;
    }
    fetch(game_url)
    .then((response) => response.json())
    .then((response) => {
      this.setState({
        imgAry: this.state.imgAry.concat(response),
        // imgAry: response,
        loaded: true,
        connectError: false
      });
      this.advanceImage();
    })
    .catch((err) => {
      console.log("Error connecting to server!");
      this.setState({
        connectError: true
      });
    })
    .done();
  },

  advanceImage: function() {
    var x = this.state.imgIndex;
    if( (this.state.imgAry.length-x) < 5 ) {
      // fetch now so we don't have to wait when there are no images left
      this.fetchSourceData();
    }
    this.setState({
      imgIndex: ++x,
      currentImageUrl: this.state.imgAry[x]["url"] //+ "?rand="+ new Date().getTime()
      // add date so that image doesn't get cached
    });
  },

  setPosition: function(e) {
    this.setState({
      x: this.state.x + (e.nativeEvent.pageX - this.drag.x),
      y: this.state.y + (e.nativeEvent.pageY - this.drag.y)
    });
    this.drag.x = e.nativeEvent.pageX;
    this.drag.y = e.nativeEvent.pageY;
  },

  resetPosition: function(e) {
    this.dragging = false;

    // Step 1: reset image location
    this.setState({
      opacity: 1,
      x: 0,
      y: 0,
    });

    // Step 2: should we count this swipe?
    var xPos = e.nativeEvent.pageX;
    var windowWidth = windowSize.width;
    var tolerance = 0.15;
    var xDelta = Math.abs(this.dragStart.x - xPos);
    // must move {tolerance} % of screen to count as a swipe
    if( (tolerance*windowWidth) < xDelta ) {
      var liked = xPos > (windowWidth/2)
      this.makeSwipe(liked)
    }
  },

  makeSwipe: function(like) {
    this.savePreference(like);
    this.setState({
      answeredCount: ++this.state.answeredCount
    });
    this.advanceImage();
  },

  savePreference: function(like) {
    // Yes/No count not used
    if(like) {
      this.setState({ Yes: ++this.state.Yes });
    } else {
      this.setState({ No: ++this.state.No });
    }

    let x = this.state.imgIndex;
    let pref = like ? 'likes' : 'dislikes';
    // this.state.currentImageTags.forEach((tag) => {
    this.state.imgAry[x]["tags"].forEach((tag) => {
      this.state.preferences.tag[tag] = this.state.preferences.tag[tag] || { likes: 0, dislikes: 0 };
      this.state.preferences.tag[tag][pref]++;
    });
    let venue = this.state.imgAry[x].venue;
    this.state.preferences.venue[venue] = this.state.preferences.venue[venue] || { likes: 0, dislikes: 0 };
    this.state.preferences.venue[venue][pref]++;
    this.state.preferences.count++;
  },

  getRotationDegree: function(rotateTop, x) {
    var rotation = ( (x/windowSize.width) * 100)/3;
    var rotate = rotateTop ? 1 : -1,
        rotateString = (rotation * rotate) + 'deg';
    return rotateString;
  },

  getCardStyle: function() {
    var transform = [{translateX: this.state.x}, {translateY: this.state.y}];
    if (this.dragging) {
        transform.push({rotate: this.getRotationDegree(this.rotateTop, this.state.x)})
    }
    return {transform: transform};
  },

  _onStartShouldSetResponder: function(e) {
    this.dragging = true;
    this.rotateTop = e.nativeEvent.locationY <= 150;
    this.drag = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY
    };
    // save start position so we can calculate total change
    this.dragStart = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY
    };
    this.state.opacity = 0.55;
    return true;
  },

  _onMoveShouldSetResponder: function(e) {
    return true;
  },

  goToResults: function() {
    this.props.navigator.push({
      title: 'Restaurant Matches',
      component: Results,
      // backButtonTitle: 'back',
      backButtonTitle: ' ',
      passProps: {
        lat: this.state.geoPosition.coords.latitude,
        long: this.state.geoPosition.coords.longitude,
        preferences: this.state.preferences
      }
    });
  },

  matchBtnText: function() {
    var remaining = MIN_NUM_SWIPES-this.state.answeredCount;
    if(remaining>0) {
      return "Swipe " + remaining + " more dishes";
    }
    return "Go to your Matches!";
  },

  render: function() {
    if(!this.state.loaded) {
      if(this.state.connectError)
        return this.renderMessageView("Error connecting to server");
      else
        return this.renderMessageView("Loading...");
    }
    return this.renderCard();
  },

  renderMessageView: function(text) {
    return (
      <View style={styles.container}>
        <View style={{ marginTop: 65 }}></View>
        <View style={styles.box}>
          <Text style={styles.myText}>{text}</Text>
        </View>
      </View>
    )
  },


  renderCard: function() {
    return (
      <View style={styles.container}>
          <Image source={{ uri: "nomz" , isStatic: true }} style={styles.bgImg} />
          <View style={styles.cardFiller} >
          </View>
          <View style={{flexDirection:'row', backgroundColor: 'transparent'}}>
            <TouchableOpacity style={styles.buttonYN} onPress={() => this.makeSwipe(false)}>
              <Image source={require('../images/food_no_icon.png')}/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonYN} onPress={() => this.makeSwipe(true)}>
              <Image source={require('../images/food_yes_icon.png')}/>
            </TouchableOpacity>
          </View>
          <View style={styles.resultsButton}>
            <Button
              style={styles.matchesBtn}
              styleDisabled={styles.machesBtnDisable}
              onPress={this.goToResults}
              disabled={this.state.answeredCount < MIN_NUM_SWIPES}
            >
              {this.matchBtnText()}
            </Button>
          </View>
          <View
            onResponderMove={this.setPosition}
            onResponderRelease={this.resetPosition}
            onStartShouldSetResponder={this._onStartShouldSetResponder}
            onMoveShouldSetResponder={this._onMoveShouldSetResponder}
            style={[styles.card, this.getCardStyle()]}
          >
            <Image
              source={{ uri: this.state.currentImageUrl }}
              style={[styles.cardImage, { opacity: this.state.opacity }]}
            />
          </View>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bgImg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.9
  },

  cardFiller: {
    height: 320
  },
  card: {
    position: 'absolute',
    top: 100,
    left: windowSize.width/2 - 150,
    width: 300,
    height: 300,
    padding: 1,
    backgroundColor: 'transparent'
  },
  cardImage: {
    height: 300,
    borderWidth: 4,
    borderRadius: 10,
    borderColor: 'white'
  },
  buttonYN: {
    paddingLeft: 35,
    paddingRight: 35
  },

  resultsButton: {
    alignItems:'center',
    top: 65,
    backgroundColor: 'transparent'
  },
  matchesBtn: {
    flexDirection: 'column',
    fontSize: 20,
    color: 'white',
    padding: 10,
    borderWidth: 3,
    borderRadius: 5,
    borderColor: 'white'
  },
  machesBtnDisable: {
    color: 'grey',
    borderColor: 'grey'
  }
});

module.exports = Application;
