'use strict';

var React = require('react-native');
var GameResultDetails = require('./game-result-details');

var {
    StyleSheet,
    Text,
    View,
    Component,
    Image,
    ListView,
    TouchableHighlight,
    NavigatorIOS,
    ActivityIndicatorIOS,
    Dimensions
} = React;

class GameResults extends Component {
    constructor(props) {
        super(props);

        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });

        this.state = {
            dataSource: ds,
            lat: props.lat,
            long: props.long,
            loading: true,
            loaderYAxis: Dimensions.get('window').height
        }
    }

    componentDidMount() {
        let url = "http://localhost:1337/api/recommend";
        url += "?lat=" + this.props.lat;
        url += "&long=" + this.props.long;
        fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.props.preferences)
            })
            .then((res) => res.json())
            .then((resData) => {
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(resData)
                });
            })
            .done();
    }

    renderRow(rowData) {
        // Use first category's image
        // Replace the url from the venue endpoint because it was returning xml instead of actual image
        var venueImage = rowData.details.bestPhoto.prefix.replace('ss3.4sqi.net', 'foursquare.com') + 'width300' + rowData.details.bestPhoto.suffix,
            venueDistance = rowData.location ? parseFloat((parseInt(rowData.location.distance) * 0.000621371)).toFixed(2) : '(?)';

        return (
            <TouchableHighlight onPress={() => this._onPress(rowData)} underlayColor='#fff'>
              <View style={styles.rowContent}>
                <View style={styles.venueDetails}>
                  <View style={styles.venueDetailsLeft}>
                    <Text style={ styles.venueRating } >
                        { rowData.details.rating.toFixed(1) }
                    </Text>
                    <Text style={ styles.venueHeader }>
                      { rowData.name }
                    </Text>
                    <Text style={ styles.venueSubheader }>
                        { venueDistance + ' mi' }
                    </Text>
                    </View>
                  <View style={styles.venueDetailsRight}>
                    <Image style={styles.venueImage} source={{ uri: venueImage }} />
                  </View>
                </View>
              </View>
            </TouchableHighlight>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicatorIOS
                    animating={this.state.loading}
                    style={[styles.centering, { height: this.state.loaderYAxis }]}
                    size='large' />
                <ListView dataSource={this.state.dataSource}
                    renderRow={this.renderRow.bind(this)} onEndReached={ this._endLoading.bind(this) }/>
            </View>
        );
    }

    _onPress(rowData) {
        this.props.navigator.push({
            component: GameResultDetails,
            title: rowData.name,
            passProps: {
                rowData: rowData,
                lat: this.state.lat,
                long: this.state.long
            }
        });
    }

    _endLoading() {
        this.state.animating = false;
        this.state.loaderYAxis = 0;
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    rowContent: {
        flex: 1,
        flexDirection: 'row',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        height: 120,
        backgroundColor: '#000'
    },
    venueDetails: {
        flexDirection: 'row',
        flex: 1,
        paddingLeft: 15
    },
    venueDetailsLeft: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },
    venueDetailsRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    venueImage: {
        width: 150,
        height: 120
    },
    venueHeader: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 20,
        backgroundColor: 'transparent',
        shadowColor: 'black',
        shadowOffset: {
            height: 1,
            width: 1
        },
        shadowRadius: 1,
        shadowOpacity: 0.9
    },
    venueSubheader: {
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
        shadowColor: 'black',
        shadowOffset: {
            height: 1,
            width: 1
        },
        shadowRadius: 1,
        shadowOpacity: 0.9
    },
    venueRating: {
        position: 'absolute',
        left: 20,
        top: -10,
        fontSize: 110,
        color: '#4169E1',
        opacity: 0.5,
        backgroundColor: 'transparent'
    }
});

module.exports = GameResults;
