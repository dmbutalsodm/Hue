const request = require('request-promise');
const LightBulb = require('./LightBulb.js');

class HueManager {
    /**
     * Sets up some local variables.
     * @constructor
     */
    constructor() {
        this.selectedBridge = null;
        this.selectedUser = null;
    }
    /**
     * Finds the bridges on your wifi network.
     * @param {string} author - The author of the book.
     * @return {array<object>} An array of all the bridges on your network.
     */
    async findBridges() {
        return request({uri: 'https://www.meethue.com/api/nupnp', json: true}).then((data) => {
            return data;
        });
    }
    /**
     * Selects a bridge.
     * @param {string} bridgeIP - The IP of the bridge you want to connect to.
     * @return {this}
     */
    setBridge(bridgeIP) {
        if (!/\b([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\b/.test(bridgeIP)) throw new Error('The IP provided was not valid.');
        this.selectedBridge = bridgeIP;
        return this;
    }
    /**
     * Creates a new user on the Hue Bridge, the link button must be pressed.
     * @param {string} deviceName - The name of the device you wish to authorize.
     * @return {Promise<String>} The API username for the passed in user.
     */
    async createUser(deviceName) {
        if (this.selectedBridge == null) throw new Error('You must select a bridge to connect to, before setting a user.');
        if (!deviceName || deviceName.length < 1) throw new Error('You must specifify a device name.');
        let options = {
            method: 'POST',
            uri: `http://${this.selectedBridge}/api`,
            json: true,
            body: {
                devicetype: deviceName,
            },
        };

        return request(options).then((data) => {
            if (data[0].error && data[0].error.type == 101) throw new Error('The link button needs to be pressed to generate a new user.');
            if (data[0].error) throw new Error(`Something went wrong: ${data[0].error}`);
            return data[0].success.username;
        });
    }
    /**
     * Sets the API username for the bridge.
     * @param {string} username - The name of the device you wish to authorize.
     * @return {this} The API username for the passed in user.
     */
    setUser(username) {
        this.selectedUser = username;
        return this;
    }
    /**
     * Verifies that both a bridge and a username are set, throws an error if not. Private method.
     */
    verify() {
        if (this.selectedBridge != null && this.selectedUser != null) return;
        throw new Error('You need to select both a bridge and username to use this method.');
    }
    /**
     * Returns all the lights on this Hue.
     * @return {Array<LightBulb>}
     */
    async getAllLights() {
        this.verify();
        let options = {
            method: 'GET',
            uri: `http://${this.selectedBridge}/api/${this.selectedUser}/lights`,
            json: true,
        };
        return request(options).then((data) => {
            let dataKeys = Object.keys(data);
            let lightBulbs = [];
            for (let i = 0; i < Object.keys(data).length; i++) {
                lightBulbs.push(new LightBulb(dataKeys[i], data[dataKeys[i]].name, data[dataKeys[i]].state, this.selectedBridge, this.selectedUser));
            }
            return lightBulbs;
        });
    }
    /**
     * Returns all the lights on this in raw data form, these have no methods and should only be used to check properties LightBulb objects do not posess.
     * @return {Array<Object>}
     */
    async getAllLightsRaw() {
        this.verify();
        let options = {
            method: 'GET',
            uri: `http://${this.selectedBridge}/api/${this.selectedUser}/lights`,
            json: true,
        };
        return request(options).then((data) => {
            return data;
        });
    }
    /**
     * Returns all the lightbulbs by a specific name, or those that match a regex.
     * @param {string|RexExp} stringOrRegex - The regular expression or string to search with.
     * @return {Array<LightBulb>}
     */
    async getLightsByName(stringOrRegex) {
        return this.getAllLights().then((allLights) => {
            let returnLights = [];
            if (stringOrRegex instanceof RegExp) {
                for (let i = 0; i < allLights.length; i++) if (stringOrRegex.test(allLights[i].getName())) returnLights.push(allLights[i]);
                return returnLights;
            }
            if (typeof stringOrRegex == 'string') {
                for (let i = 0; i < allLights.length; i++) if (allLights[i].getName() == stringOrRegex) returnLights.push(allLights[i]);
                return returnLights;
            }
            return [];
        });
    }
    /**
     * Returns all the lightbulbs in a group by a specific name.
     * @param {string} groupName - The string to search with.
     * @return {Array<LightBulb>}
     */
    async getLightsByGroupName(groupName) {
        this.verify();
        let options = {
            method: 'GET',
            uri: `http://${this.selectedBridge}/api/${this.selectedUser}/groups`,
            json: true,
        };
        return request(options).then((data) => {
            let dataKeys = Object.keys(data);
            let lightBulbsNeeded = [];
            for (let i = 0; i < Object.keys(data).length; i++) {
                if (data[dataKeys[i]].name == groupName) {
                    lightBulbsNeeded = data[dataKeys[i]].lights;
                    break;
                }
            }
            let returnBulbs = [];
            return this.getAllLights().then((allLights) => {
                for (let i = 0; i < allLights.length; i++) {
                    if (lightBulbsNeeded.includes(allLights[i].getNumber())) returnBulbs.push(allLights[i]);
                }
                return returnBulbs;
            });
        });
    }
}

module.exports = HueManager;
