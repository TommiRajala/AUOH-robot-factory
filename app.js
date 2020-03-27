const axios = require('axios');
const mqtt = require('mqtt');
const mqtt_client = mqtt.connect('wss://auoh-mqtt-test.herokuapp.com');

/**
 * Regular expression match function to
 * get joint values from web.
 * Arg res : Axios response
 * 
 * Returns: joints array
 */
async function getJointValuesFromResponse(res) {
    //                   Joint 0...9,   Any number of digits . any number of ditis. Global flag
    let re = new RegExp('Joint +[0-9]: +(-*[0-9]+\.[0-9]+)', 'g')
    let joints = [];
    let matches = res.data.matchAll(re);
    let count = 0;

    for (const match of matches) {
        count++;
        if (count > 6) break;
        const value = parseFloat(match[1]); // Save regex group1 of the match
        joints.push(value);
    }
    return joints;
}

/**
 * Main program. Recover web data every 1000ms.
 * Prints joints values with timestamps to log.
 */
const main_loop = () => {
    setTimeout(() => {
        const startTimeStamp = new Date();
        let timeDelta = startTimeStamp;
        axios.get('https://fanuc-robot-http-server.herokuapp.com/')
            .then((res) => {
                timeDelta = Date.now() - startTimeStamp;
                return getJointValuesFromResponse(res);
            })
            .then((jointValueArray) => {
                console.log(startTimeStamp, jointValueArray, timeDelta, 'ms');
                let data = {
                    time: startTimeStamp,
                    joints: jointValueArray
                }
                mqtt_client.publish('Robot data', JSON.stringify(data))
            });
        main_loop();
    }, 10);
}

mqtt_client.on('connect', () => {
    console.log('connected to mqtt broker');
    main_loop();
});

mqtt_client.on('error', function (err) {
    console.log(err);
    mqtt_client.end();
})
