


module.exports =  function(RED) {
    function MatterCommand(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.controller = RED.nodes.getNode(config.controller);
        node.device = BigInt(config.device)
        node.endpoint = config.endpoint || 0
        node.cluster = Number(config.cluster)
        node.command = config.command
        console.log(`Controller: ${node.controller.id}, Device: ${node.device}, Cluster: ${node.cluster}, Command: ${node.command}`)         
       
        this.on('input', function(msg) {
            _data = RED.util.evaluateNodeProperty(config.data, config.dataType, node, msg);
            node.controller.commissioningController.connectNode(node.device).then((device) => {
                const ep = device.getDevices()
                const clc = ep[Number(node.endpoint)].getClusterClientById(Number(node.cluster))
                eval("clc.commands."+node.command+"("+_data+")")
                .then(() => {
                    msg.payload = 'ok'
                    node.send(msg)
                })
                .catch((e) => node.error(e))
            })
        })
    }   

    RED.nodes.registerType("mattercommand",MatterCommand);

}
