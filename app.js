const axios = require('axios');

/**
 * Regular expression match function to
 * get joint values from web.
 * Arg res : Axios response
 * 
 * Returns: joints array
 */
async function parseResponse(res) {
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
    const startTimeStamp = new Date();
    setTimeout(() => {
        
        axios.get('https://fanuc-robot-http-server.herokuapp.com/')
            .then((res) => {
                return parseResponse(res);
            })
            .then((jointValueArray) => {
                const timeDelta = Date.now() - startTimeStamp;
                console.log(startTimeStamp, jointValueArray, timeDelta, 'ms');
            });
        main_loop();
    }, 1000);
}
main_loop();
