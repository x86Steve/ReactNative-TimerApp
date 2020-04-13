import React from 'react';
import {Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View, Picker, Platform} from 'react-native';
import Sound from 'react-native-sound';

const screen = Dimensions.get('window');

const formatNumber = number => `0${number}`.slice(-2);

const getRemaining = (timeInSeconds) =>
{
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds - minutes * 60;

    return {minutes: formatNumber(minutes), seconds: formatNumber(seconds)};
};

const createArray = length =>
{
    const arr = [];
    let i = 0;
    while (i < length)
    {
        arr.push(i.toString());
        i += 1;
    }
    return arr;
};

const timerFinishedNaturally = () =>
{
    return this.state.finishedNaturally;
};

const AVAILABLE_MINUTES = createArray(100);
const AVAILABLE_SECONDS = createArray(60);

// Enable playback in silence mode
Sound.setCategory('Playback');

// Load the sound file 'whoosh.mp3' from the app bundle
// See notes below about preloading sounds within initialization code below.
const alertSound = new Sound('alert.mp3', Sound.MAIN_BUNDLE);

export default class App extends React.Component
{
    state =
        {
            remainingSeconds: 300,
            isRunning: false,
            selectedMinutes: '5',
            selectedSeconds: '0',
            finishedNaturally: false,
        };

    interval = null;

    componentDidUpdate(prevProp, prevState)
    {
        if (this.state.remainingSeconds === 0 && prevState.remainingSeconds !== 0)
        {
            this.stop();
            this.setState(
                {
                    finishedNaturally: true,
                },
            );

        }
    }


    componentWillUnmount()
    {
        if (this.interval)
        {
            clearInterval(this.interval);
        }
    }

    start = () =>
    {
        this.setState(state => ({
            isRunning: true,
            finishedNaturally: false,
            remainingSeconds:
                parseInt(state.selectedMinutes) * 60 +
                parseInt(state.selectedSeconds),
        }));
        this.interval = setInterval(() =>
        {
            this.setState(state => ({
                remainingSeconds: state.remainingSeconds - 1,
            }));
        }, 1000);
    };

    stop = () =>
    {
        clearInterval(this.interval);
        this.interval = null;
        this.setState
        (state =>
            ({
                isRunning: false,
                remainingSeconds: 300,
            }),
        );
    };

    renderTimerFinished = (soundFile) =>
    {
        if (this.state.finishedNaturally)
        {
            soundFile.setNumberOfLoops(-1);
            soundFile.play();
            return (
                <View style={styles.container}>
                    <Text style={[styles.buttonText, styles.buttonTextStop]}>Timer Finished!</Text>
                    {
                        this.renderOk()
                    }
                </View>
            );
        }
    };

    renderStart = () =>
    {
        if (this.state.finishedNaturally)
        {
            return null;
        }
        else if (!this.state.isRunning)
        {
            return (
                <TouchableOpacity onPress={() => this.start()} style={styles.button}>
                    <Text style={styles.buttonText}>Start</Text>
                </TouchableOpacity>
            );
        }
    };

    renderOk = () =>
    {
        return (
            <View>
                <TouchableOpacity style={styles.button} onPress={() =>
                {
                    this.setState({
                        finishedNaturally: false,
                    });
                    alertSound.stop();
                }}>
                    <Text style={[styles.buttonText, styles.buttonText]}> Thanks! </Text>
                </TouchableOpacity>
            </View>
        );
    };

    renderStop = () =>
    {
        if (this.state.finishedNaturally)
        {
            return null;
        }
        if (this.state.isRunning)
        {
            return (
                <TouchableOpacity onPress={() => this.stop()}
                                  style={[styles.button, styles.buttonStop]}>
                    <Text style={[styles.buttonText, styles.buttonTextStop]}>Stop</Text>
                </TouchableOpacity>
            );
        }
    };

    renderTimer = () =>
    {
        if (this.state.finishedNaturally)
        {
            return null;
        }
        if (!this.state.isRunning)
        {
            const {minutes, seconds} = getRemaining(parseInt(this.state.selectedMinutes * 60) + parseInt(this.state.selectedSeconds));
            return <Text style={styles.timerText}>{`${minutes}:${seconds}`}</Text>;
        }
        else
        {
            const {minutes, seconds} = getRemaining(this.state.remainingSeconds);
            return <Text style={styles.timerText}>{`${minutes}:${seconds}`}</Text>;
        }
    };


    renderPickers = () =>
    {
        if (this.state.finishedNaturally)
        {
            return null;
        }
        if (!this.state.isRunning)
        {
            return (
                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerItem}>Minutes</Text>
                    <Picker
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                        selectedValue={this.state.selectedMinutes}
                        mode="dropdown"
                        onValueChange={itemValue =>
                        {
                            this.setState({
                                selectedMinutes: itemValue,
                            });
                        }}>
                        {AVAILABLE_MINUTES.map(value => (
                            <Picker.Item key={value} label={value} value={value}/>
                        ))}
                    </Picker>

                    <Text style={styles.pickerItem}>Seconds</Text>
                    <Picker
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                        selectedValue={this.state.selectedSeconds}
                        mode={'dropdown'}
                        onValueChange={itemValue =>
                        {
                            this.setState({
                                selectedSeconds: itemValue,
                            });
                        }}>
                        {AVAILABLE_SECONDS.map(value => (
                            <Picker.Item key={value} label={value} value={value}/>
                        ))}
                    </Picker>
                </View>
            );
        }
    };


    render()
    {
        return (
            <View style={styles.container}>
                <StatusBar barStyle={'light-content'}/>
                {
                    this.renderTimerFinished(alertSound)
                }
                {
                    this.renderPickers()
                }
                {
                    this.renderTimer()
                }
                {
                    this.renderStart()
                }
                {
                    this.renderStop()
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
        container:
            {
                flex: 1,
                backgroundColor: '#07121B',
                alignItems: 'center',
                justifyContent: 'center',
            },
        button:
            {
                borderWidth: 10,
                borderColor: '#89aaff',
                width: screen.width / 2,
                height: screen.width / 2,
                borderRadius: screen.width / 2,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 30,
            },
        buttonStop:
            {
                borderColor: '#FF851B',
            },
        buttonText:
            {
                fontSize: 45,
                color: '#89AAFF',
            },
        buttonTextStop:
            {
                color: '#FF851B',
            },
        timerText:
            {
                color: '#fff',
                fontSize: 90,
            },
        picker:
            {
                width: 85,
                fontSize: 30,
                alignContent: 'center',
                ...Platform.select(
                    {
                        android: {
                            color: '#fff',
                            backgroundColor: '#07121B',
                            marginLeft: 10,
                        },
                    },
                ),
            },
        pickerItem:
            {
                color: '#fff',
                fontSize: 20,
            },
        pickerContainer:
            {
                flexDirection: 'row',
                alignContent: 'center',
            },
    },
);
