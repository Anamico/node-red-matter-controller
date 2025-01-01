const {cap} = require('./utils')



module.exports =  function(RED) {
    function MatterReadAttr(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.controller = RED.nodes.getNode(config.controller);
        node._id = BigInt(config.device.split('-')[0])
        node._ep = config.device.split('-')[1] || 1
        node.cluster = Number(config.cluster)
        node.attr = cap(config.attr)
        this.on('input', function(msg) {
            node.controller.commissioningController.connectNode(node._id).then((device) => {
                const ep = device.getDeviceById(node._ep)
                const clc = ep.getClusterClientById(Number(node.cluster))               
                try {
                    let command = eval(`clc.get${node.attr}Attribute`)
                    command()
                    .then((attr_resp) => {
                        msg.payload = attr_resp
                        node.send(msg)
                    })
                    .catch((e) => node.error(e))
                } catch (error) {
                    node.error(error)
                }
            })
        })
    }   

    RED.nodes.registerType("matterreadattr",MatterReadAttr);

}
