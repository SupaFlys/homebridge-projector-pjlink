var pjlink = require('pjlink');
const util = require('util');

const debug = false;

var Service;
var Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-projector-pjlink", "PJLinkProjector",
				 PJLinkProjector);
};

function PJLinkProjector(log, config) {
    this.log = log;
    this.ip = config["ip"];
    this.serial = config["serial"] || "";
    this.poll = config["poll"] === true;
    this.interval = parseInt(config["interval"] || 15,10);
    this.beamer=new pjlink(this.ip);
    
    this.readProjectorDetails=async function () {
	this.log("Reading Projector Details...");
	const getMan=util.promisify(this.beamer.getManufacturer.bind(this.beamer));
	try {
	    this.manufacturer=await getMan();
	} catch(err) {
	    this.manufacturer='';
	}
	this.log("Got Manufacturer: "+this.manufacturer);

	const getModel=util.promisify(this.beamer.getModel.bind(this.beamer));
	try {
	    this.model=await getModel();
	} catch(err) {
	    this.model='';
	}
	this.log("Got Model: "+this.model);

	if (config["name"]) {
	    this.name=config["name"];
	} else {
	    try {
		const getName=util.promisify(this.beamer.getName.bind(this.beamer));
		this.name=await getName();
	    } catch(err) {
		this.name="PJLinkProjector";
	    }
	}
	this.log("Got Name: "+this.name);
    };
    this.readProjectorDetails()
	.then(() => {this.log("Finished Initializing")})
	.catch(this.log);
}


PJLinkProjector.prototype = {
    getPowerState: function (callback) {
	this.beamer.getPowerState((error,state) => {
            if (error) {
                callback(error);
		return;
	    }
	    if (debug) {
		this.log("Power State: ",state);
	    }
	    callback(null, state !== pjlink.POWER.OFF);
	});
    },

    lensCommand: function(powerOn, callback) {
	if(debug)
	    this.log("Setting lens state to: "+powerOn);
	this.beamer.Command('POPLP','01',callback);
    },
	
    setPowerState: function(powerOn, callback) {
	if(debug)
	    this.log("Setting power state to: "+powerOn);
	this.beamer.setPowerState(powerOn?pjlink.POWER.ON:pjlink.POWER.OFF,callback);
    },

    pollPowerState: function() {
        clearTimeout(this.pollingTimeOut);
	this.getPowerState(
	    (error,value) => {
		if (debug && error) {
			this.log("Error encountered while polling state: ",error)
		}
		this.pollingTimeOut = setTimeout(
		    this.pollPowerState.bind(this),
		    this.interval * 1000);
		if(!error) {
		    this.switchService.getCharacteristic(Characteristic.On).
			updateValue(value);
		}
	    });
	
    },

    getServices: function () {
        const informationService = new Service.AccessoryInformation();
        informationService
            .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
            .setCharacteristic(Characteristic.Model, this.model)
            .setCharacteristic(Characteristic.SerialNumber, this.serial);

        switchService = new Service.Switch(this.name);
        switchService
            .getCharacteristic(Characteristic.On)
                .on('get', this.getPowerState.bind(this))
                .on('set', this.setPowerState.bind(this));

        this.informationService = informationService;
        this.switchService = switchService;
	if (this.poll) {
	    this.pollPowerState();
	}
        return [informationService, switchService];
    }
};
