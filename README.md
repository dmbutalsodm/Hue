# hue-manager

[![npm package](https://nodei.co/npm/hue-manager.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/hue-manager/)

Hue manager is a lightweight library to interact with the Phillips Hue REST API. It's meant for basic light controls and sacrafices 100% coverage in exchange for size.

# Setup
```javascript
const HueManager = require('hue-manager');
const hm = new HueManager();

hm.setBridge('10.0.0.1').setUser('LJQflh74iIP9DdFbVZ4ZhWF7ciKuzZCa');
```
Once you store your credentials in the manager, you have access to the rest of the light control methods.

# Usage
Any search for lightbulbs (with the exception of `hm.getAllLightsRaw()` will return an array of `LightBulb` objects.

```javascript
hm.getAllLights().then((allBulbs) => {
    allBulbs.forEach((bulb) => {
        bulb.turnOn();
    });
});
```
Gets all the lights from the hue, and then turns all them on.
```javascript
hm.getLightsByName('Kitchen1').then((bulbs) => {
    bulbs[0].turnOn();
});

hm.getLightsByName(/Kitchen./).then((bulbs) => {
    bulbs[0].turnOn();
    bulbs[1].turnOn();
    bulbs[2].turnOn();
});
```
Searching for lights by name. Instead of using a string, you can also use a regex pattern. 
##### Note: Because the hue does not allow the colour, temperature, saturation, or brightness of a light to be interacted with while the light is off, you can enable error throwing if attempted by using `hm.throwErrors(true);`.

```javascript
hm.getLightsByGroupName('Kitchen').then((data) => {
    data.forEach((element) => {
        element.turnOn();
    });
});
```
Additionally, you can also search for lights that are in a specific group. This method does not accept regex.

```javascript
hm.getAllLightsRaw().then((data) => {
    console.log(data);
});
```
Because the lightbulb object does not store all the information a lightbulb holds (only the relevant methods for the API), an additional method is inclcuded to simply fetch the raw data if this information is needed for any reason.

```javascript
hm.getLightsByName(/Kitchen./).then((bulbs) => {
    bulbs[0].turnOn().setBrightness(255).setColorXY(.2323, .1111);
    bulbs[1].setColorTemperature(45000).setColorRGB(...[255, 100, 100]);
    bulbs[2].turnOn().setSaturation(200).setHue(35523).renameLight('Secret lightbulb name').blinkLong();
    bulbs[3].blink().setTransitionTime(3).startColorLoop().stopColorLoop();
});
```
All the basic control methods exist, and all are chainable.
