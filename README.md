## A Homebridge plugin for controlling PJLink-based projectors 

This allows controlling projectors which support for the simple [PJLink protocol](https://pjlink.jbmia.or.jp/english/).  A configuration example:

```
  "accessories": [
    {
	"accessory": "PJLinkProjector"
	"name": "MyProjector",
	"ip": "192.168.0.2",
	"poll": true,
	"interval": 20
    }
  ]
```

Fields:

- ip: (_required_) The (fixed) IP address of your projector.  Reserve an IP in your router.
- name: How homekit will identify your projector.  Defaults to the projector's self-reported name.
- poll: `true` or `false`: whether to poll the state of your projector's power, to update Homekit.  Defaults to `false`
- interval: a polling interval, in seconds. Defaults to 15s.


Uses the [pjlink library](https://github.com/sy1vain/node-pjlink).
Based originally on [`homebridge-epson-projector`](https://github.com/valkjsaaa/homebridge-epson-projector).

Steps:

1. Connect your projector to your home network.
2. Reserve an IP address for your projector.
3. Create your config file according to [`config-example.json`](config-example.json)
