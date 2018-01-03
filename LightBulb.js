const request = require('request-promise');

class LightBulb {
    /**
     * Represents a Hue lightbulb.
     * @constructor
     * @param {string} number - The number that the bridge has assigned to this lightbulb.
     * @param {string} name -  The name of this bulb.
     * @param {Object} state - An object representing the state of this bulb.
     * @param {string} selectedBridge - The IP adress for the bridge.
     * @param {string} selectedUser - The username for authentication.
     */
    constructor(number, name, state, selectedBridge, selectedUser) {
        this.number = number;
        this.name = name;
        this.state = state;
        this.selectedBridge = selectedBridge;
        this.selectedUser = selectedUser;
    }
    /**
     * Returns the name of the bulb.
     * @return {string}
     */
    getName() {
        return this.name;
    }
    /**
     * Returns the number the bridge has assigned to this bulb.
     * @return {string}
     */
    getNumber() {
        return this.number;
    }
    /**
     * Returns whether the light is on or not.
     * @return {boolean}
     */
    isOn() {
        return this.state.on;
    }
    /**
     * Simple request to edit the state. Private method.
     * @param {Object} payload - The body to send with the request.
     */
    statePutRequest(payload) {
        let options = {
            method: 'PUT',
            uri: `http://${this.selectedBridge}/api/${this.selectedUser}/lights/${this.number}/state`,
            body: payload,
            json: true,
        };
        request(options);
    }
    /**
     * Changes the name of the bulb.
     * @param {string} name - The brightness to send to the bulb.
     * @return {this}
     */
    renameLight(name) {
        let options = {
            method: 'PUT',
            uri: `http://${this.selectedBridge}/api/${this.selectedUser}/lights/${this.number}`,
            body: {name: name},
            json: true,
        };
        request(options);
        return this;
    }
    /**
     * Turns the light on.
     * @return {this}
     */
    turnOn() {
        this.statePutRequest({on: true});
        this.state.on = true;
        return this;
    }
    /**
     * Turns the light off.
     * @return {this}
     */
    turnOff() {
        this.statePutRequest({on: false});
        this.state.on = false;
        return this;
    }
        /**
     * Blinks the light once.
     * @return {this}
     */
    blink() {
        this.statePutRequest({alert: 'select'});
        return this;
    }
    /**
     * Blinks the light for 15 seconds.
     * @return {this}
     */
    blinkLong() {
        this.statePutRequest({alert: 'lselect'});
        return this;
    }
    /**
     * Cycles through all hues using the current brightness and saturation settings.
     * @return {this}
     */
    startColorLoop() {
        if (!this.isOn()) throw new Error('You cannot change a light\'s settings while it is off.');
        this.statePutRequest({effect: 'colorloop'});
        return this;
    }
    /**
     * Stops the color loop.
     * @return {this}
     */
    stopColorLoop() {
        if (!this.isOn()) throw new Error('You cannot change a light\'s settings while it is off.');
        this.statePutRequest({effect: 'none'});
        return this;
    }
    /**
     * Sets the transition time between states. This is given as a multiple of 100ms, so setting it to 10 will yield a time of 1 second.
     * @param {number} tTime - The transition time to send to the bulb.
     * @return {this}
     */
    setTransitionTime(tTime) {
        if (tTime < 0 || tTime > 65535) throw new Error('Transition time must be between 0 and 65535.');
        this.statePutRequest({transitiontime: tTime});
        return this;
    }
    /**
     * Updates the light colour with the built-in XY scheme.
     * @param {number} x - The X value to be sent.
     * @param {number} y - The Y value to be sent.
     * @return {this}
     */
    setColorXY(x, y) {
        if (!this.isOn()) throw new Error('You cannot change a light\'s settings while it is off.');
        this.statePutRequest({xy: [x, y]});
        return this;
    }
    /**
     * Updates the light colour, the RGB values will be corrected to the XY scheme using the Hue suggested method.
     * @param {number} red - The red value to be sent, between 0 and 255.
     * @param {number} green - The green value to be sent, between 0 and 255.
     * @param {number} blue - The blue value to be sent, between 0 and 255.
     * @return {this}
     */
    setColorRGB(red, green, blue) {
        if (!this.isOn()) throw new Error('You cannot change a light\'s settings while it is off.');
        red = (Math.min(Math.max(red, 0), 255)) / 255; // 1. Changes all values to be bound between 0 and 255, then makes them decimals of X/255.
        green = (Math.min(Math.max(green, 0), 255)) / 255;
        blue = (Math.min(Math.max(blue, 0), 255)) / 255;

        red = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92); // 2. Applies gamma correction values to each of the RGB values.
        green = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
        blue = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92);

        const wideRed = red * 0.664511 + green * 0.154324 + blue * 0.162028; // 3. Convert RGB to Wide RGB D65.
        const wideGreen = red * 0.283881 + green * 0.668433 + blue * 0.047685;
        const wideBlue = red * 0.000088 + green * 0.072310 + blue * 0.986039;

        const xy = [ // 4. Convert XYZ/RGB to XY.
            wideRed / (wideRed + wideGreen + wideBlue),
            wideGreen / (wideRed + wideGreen + wideBlue),
        ];
        this.setColorXY(...xy);
        return this;
    }
    /**
     * Sets the brightness of the bulb.
     * @param {number} brightness - The brightness to send to the bulb.
     * @return {this}
     */
    setBrightness(brightness) {
        if (!this.isOn()) throw new Error('You cannot change a light\'s settings while it is off.');
        if (brightness < 0 || brightness > 255) throw new Error('Brightness must be between 0 and 255.');
        this.statePutRequest({bri: brightness});
        return this;
    }
    /**
     * Changes the brightness by the number you provide.
     * @param {number} change - The amount to change the brightness by. Can be negative.
     * @return {this}
     */
    incrementBrightness(change) {
        if (!this.isOn()) throw new Error('You cannot change a light\'s settings while it is off.');
        if (change < -255 || change > 255) throw new Error('Brightness increment must be between -255 and 255.');
        this.statePutRequest({bri_inc: change});
        return this;
    }
    /**
     * Sets the hue of the bulb.
     * @param {number} hue - The hue to send to the bulb.
     * @return {this}
     */
    setHue(hue) {
        if (!this.isOn()) throw new Error('You cannot change a light\'s settings while it is off.');
        if (hue < 0 || hue > 65535) throw new Error('Hue must be between 0 and 65535.');
        this.statePutRequest({hue: hue});
        return this;
    }
    /**
     * Changes the hue by the number you provide.
     * @param {number} change - The amount to change the hue by. Can be negative.
     * @return {this}
     */
    incrementHue(change) {
        if (!this.isOn()) throw new Error('You cannot change a light\'s settings while it is off.');
        if (change < -65535 || change > 65535) throw new Error('Hue increment must be between -65535 and 65535.');
        this.statePutRequest({hue_inc: change});
        return this;
    }
    /**
     * Sets the color temperature of the bulb.
     * @param {number} ct - The hue to send to the bulb.
     * @return {this}
     */
    setColorTemperature(ct) {
        if (!this.isOn()) throw new Error('You cannot change a light\'s settings while it is off.');
        if (ct < 0 || ct > 65535) throw new Error('Color temperature must be between 0 and 65535.');
        this.statePutRequest({ct: ct});
        return this;
    }
    /**
     * Changes the color temperature by the number you provide.
     * @param {number} change - The amount to change the hue by. Can be negative.
     * @return {this}
     */
    incrementColorTemperature(change) {
        if (!this.isOn()) throw new Error('You cannot change a light\'s settings while it is off.');
        if (change < -65535 || change > 65535) throw new Error('Color temperature increment must be between -65535 and 65535.');
        this.statePutRequest({ct_inc: change});
        return this;
    }
    /**
     * Sets the saturation of the bulb.
     * @param {number} saturation - The brightness to send to the bulb.
     * @return {this}
     */
    setSaturation(saturation) {
        if (!this.isOn()) throw new Error('You cannot change a light\'s settings while it is off.');
        if (saturation < 0 || saturation > 255) throw new Error('Saturation must be between 0 and 255.');
        this.statePutRequest({sat: saturation});
        return this;
    }
    /**
     * Changes the saturation by the number you provide.
     * @param {number} change - The amount to change the saturation by. Can be negative.
     * @return {this}
     */
    incrementSaturation(change) {
        if (!this.isOn()) throw new Error('You cannot change a light\'s settings while it is off.');
        if (change < -255 || change > 255) throw new Error('Saturation increment must be between -255 and 255.');
        this.statePutRequest({sat_inc: change});
        return this;
    }
}

module.exports = LightBulb;
