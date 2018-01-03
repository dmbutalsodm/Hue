const HueManager = require('./index.js');
const hm = new HueManager();
const credentials = require('./credentials.js');

hm.setBridge(credentials.ip).setUser(credentials.username);

hm.getAllLights().then((allBulbs) => {
    allBulbs.forEach((bulb) => {
        if (bulb.getName() == 'Kitchen1') {
            bulb.turnOn().setColorRGB(100, 123, 255).setBrightness(100);
        }
    });
});

hm.getLightsByName(/Kitchen./).then((bulbs) => {
    bulbs[0].setBrightness(255);
    bulbs[1].setColorTemperature(45000);
    bulbs[2].turnOff();
});

hm.getLightsByName('Kitchen1').then((bulbs) => {
    try {
        bulbs[0].setSaturation(255);
    } catch (e) {
        bulbs[0].turnOn();
    }
});

hm.getAllLightsRaw().then((data) => {
    console.log(data);
});

hm.getLightsByGroupName('Kitchen').then((data) => {
    data.forEach((element) => {
        element.turnOn();
    });
});
