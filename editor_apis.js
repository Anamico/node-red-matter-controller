const {commandOptions, attributeOptions} = require('./utils')


module.exports =  function(RED) {

//List Interfaces
RED.httpAdmin.get('/_mattercontroller/interfaces', RED.auth.needsPermission('admin.write'), function(req,res){
    let interfaces = os.networkInterfaces()
    let output = []
    for (let i in interfaces) {
        for (let i2 in interfaces[i]) {
            if (!interfaces[i][i2].internal && interfaces[i][i2].family == "IPv6")
                output.push(i)
        }
    }
    res.send(output)
})

// List Devices
RED.httpAdmin.get('/_mattercontroller/:id/devices/', RED.auth.needsPermission('admin.write'), function(req,res){
    let ctrl_node = RED.nodes.getNode(req.params.id)
    if (ctrl_node){
        deviceList = {}
        const nodes = ctrl_node.commissioningController.getCommissionedNodes();
        nodes.forEach(nodeId => {
            ctrl_node.commissioningController.connectNode(nodeId)
            .then((conn) => {
                info = conn.getRootClusterClient(BasicInformationCluster)
                info.getNodeLabelAttribute()
                .then((nodeLabel) => {
                    deviceList[nodeId] = nodeLabel
                    if (Object.keys(deviceList).length == nodes.length){
                        res.send(deviceList)
                    }    
                })
            })
        })
    }
    else {
        res.sendStatus(404);  
    }

})
// List Clusters
RED.httpAdmin.get('/_mattercontroller/:cid/device/:did/clusters', RED.auth.needsPermission('admin.write'), function(req,res){
    let ctrl_node = RED.nodes.getNode(req.params.cid)
    if (ctrl_node){
        ctrl_node.commissioningController.connectNode(BigInt(req.params.did))
        .then((conn) => {
            let d = conn.getDevices()
            let cl = d[0].getAllClusterClients()
            clusterList = {}
            cl.forEach((c) => {
                clusterList[c.id] = c.name
            })
            res.send(clusterList)
        })
    }
    else {
        res.sendStatus(404);  
    }
})
// List Commands
RED.httpAdmin.get('/_mattercontroller/:cid/device/:did/cluster/:clid/commands', RED.auth.needsPermission('admin.write'), function(req,res){
    let ctrl_node = RED.nodes.getNode(req.params.cid)
    if (ctrl_node){
        ctrl_node.commissioningController.connectNode(BigInt(req.params.did))
        .then((conn) => {
            let d = conn.getDevices()
            cmds = d[0].getClusterClientById(Number(req.params.clid)).commands
            res.send(Object.keys(cmds))
        })
    }
    else {
        res.sendStatus(404);  
    }
})

// Get Command options
RED.httpAdmin.get('/_mattermodel/cluster/:clid/command/:cmd/options', RED.auth.needsPermission('admin.write'), function(req,res){
        let data = commandOptions(req.params.clid, req.params.cmd)
        res.send(data)
})

// List Attributes
RED.httpAdmin.get('/_mattercontroller/:cid/device/:did/cluster/:clid/attributes', RED.auth.needsPermission('admin.write'), function(req,res){
    let ctrl_node = RED.nodes.getNode(req.params.cid)
    if (ctrl_node){
        ctrl_node.commissioningController.connectNode(BigInt(req.params.did))
        .then((conn) => {
            let d = conn.getDevices()
            atrs = d[0].getClusterClientById(Number(req.params.clid)).attributes
            res.send(Object.keys(atrs))
        })
    }
    else {
        res.sendStatus(404);  
    }
})

// List Writable Attributes
RED.httpAdmin.get('/_mattercontroller/:cid/device/:did/cluster/:clid/attributes_writable', RED.auth.needsPermission('admin.write'), function(req,res){
    let ctrl_node = RED.nodes.getNode(req.params.cid)
    if (ctrl_node){
        ctrl_node.commissioningController.connectNode(BigInt(req.params.did))
        .then((conn) => {
            let d = conn.getDevices()
            atrs = d[0].getClusterClientById(Number(req.params.clid)).attributes
            let response = []
            Object.keys(atrs).forEach((k) => {
                if (atrs[k].attribute.writable) {
                    response.push(k)
                }
            })
            res.send(response)
        })
    }
    else {
        res.sendStatus(404);  
    }
})

// Get Attribute options
RED.httpAdmin.get('/_mattermodel/cluster/:clid/attribute/:attr/options', RED.auth.needsPermission('admin.write'), function(req,res){
    let data = attributeOptions(req.params.clid, req.params.attr)
    res.send(data)
})
}