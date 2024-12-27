const {cap} = require('./utils')



module.exports =  function(RED) {
    function MatterSubscribe(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.controller = RED.nodes.getNode(config.controller);
        node.device = BigInt(config.device)
        node.endpoint = config.endpoint || 0
        node.cluster = Number(config.cluster)
        node.attr = cap(config.attr)
        node.topic = config.topic

        function subscribe(node){
            node.controller.commissioningController.connectNode(node.device)
            .then((device) => {
                const ep = device.getDevices()
                const clc = ep[Number(node.endpoint)].getClusterClientById(Number(node.cluster))        
                let command = eval(`clc.add${node.attr}AttributeListener`)
                command(value => {
                    msg = {topic: node.topic}
                    msg.payload = value
                    node.send(msg)
                })
            })
        }
        function waitforserver(node) {
            if (!node.controller.started) {
              setTimeout(waitforserver, 100, node)
            } else {
                node.log('Setting Subscription...')
                subscribe(node)
            }
        }
        
        waitforserver(node)
        

    }   
    RED.nodes.registerType("mattersubscribe",MatterSubscribe);

}
