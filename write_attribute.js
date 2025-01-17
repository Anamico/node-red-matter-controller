const {cap, resolveTyped} = require('./utils')



module.exports =  function(RED) {
    function MatterWriteAttr(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.controller = RED.nodes.getNode(config.controller);
        node._id = BigInt(config.device.split('-')[0])
        node._ep = config.device.split('-')[1] || 1
        node.cluster = Number(config.cluster)
        node.attr = cap(config.attr)
        this.on('input', function(msg) {
            resolveTyped(RED, config.data, config.dataType, node, msg)
            .then((_data) => {
                node.controller.commissioningController.connectNode(node._id).then((conn) => {
                    const ep = conn.getDeviceById(Number(node._ep))
                    const clc = ep.getClusterClientById(Number(node.cluster))               
                    try {
                        let command = eval(`clc.set${node.attr}Attribute`)
                        command(_data)
                        .then((attr_resp) => {
                            node.log(attr_resp)
                            msg.payload = 'ok'
                            node.send(msg)
                        })
                        .catch((e) => node.error(e))
                    } catch (error) {
                        node.error(error)
                    }
                })
            })
            .catch((e) => {
                node.error(e)
            })
        })
    }   

    RED.nodes.registerType("matterwriteattr",MatterWriteAttr);

}