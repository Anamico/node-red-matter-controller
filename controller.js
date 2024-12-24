const { Environment, Logger, singleton, StorageService, Time } = require( "@matter/main");
const { BasicInformationCluster, DescriptorCluster, GeneralCommissioning, OnOff } = require( "@matter/main/clusters");
const { ClusterClientObj, ControllerCommissioningFlowOptions } = require("@matter/main/protocol") 
const { ManualPairingCodeCodec, QrPairingCodeCodec, NodeId } = require("@matter/main/types")
const os = require('os');

//Some parts of the controller are still in the legacy packages
var { CommissioningController, NodeCommissioningOptions } =  require("@project-chip/matter.js")
var { NodeStates } =  require("@project-chip/matter.js/device")


const environment = Environment.default;

module.exports =  function(RED) {
    function MatterController(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.networkInterface = config.networkInterface 
        node.logLevel = config.logLevel
        Environment.default.vars.set('mdns.networkInterface', node.networkInterface);
        node.commissioningController = new CommissioningController({
            environment: {
                environment,
                id: node.id
            },
            autoConnect: false,
        })
        node.commissioningController.start();
    }
    RED.nodes.registerType("mattercontroller",MatterController);

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
            ctrl_node = {commissioningController : commissioningController}
            deviceList = {}
            const nodes = ctrl_node.commissioningController.getCommissionedNodes();
            nodes.forEach(nodeId => {
                const conn = ctrl_node.commissioningController.connectNode(nodeId)
                conn.then(() => {
                    node.getRootClusterClient(BasicInformationCluster).then((info) => {
                        info.getProductNameAttribute().then((productName) => {
                            deviceList[node.nodeId] = productName
                        })
                        //TODO If productName is blank may need to use other attributes here, or prioritse other user label
                    })
                })
                
            });
            res.send(deviceList)
        }
        else {
            res.sendStatus(404);  
        }
    
    })
    // List Clusters
    RED.httpAdmin.get('/_mattercontroller/:cid/device/:did/clusters', RED.auth.needsPermission('admin.write'), function(req,res){
        let ctrl_node = RED.nodes.getNode(req.params.cid)
        if (ctrl_node){
            let n = ctrl_node.commissioningController.connectNode(req.params.did);
            let d = nx.getDevices()
            let cl = d[0].getAllClusterClients()
            clusterList = {}
            cl.forEach((c) => {
                clusterList[c.id] = c.name
            })
            res.send(clusterList)
        }
        else {
            res.sendStatus(404);  
        }
    })
    // List Commands
    RED.httpAdmin.get('/_mattercontroller/:cid/device/:did/cluster/:clid/commands', RED.auth.needsPermission('admin.write'), function(req,res){
        let ctrl_node = RED.nodes.getNode(req.params.cid)
        if (ctrl_node){
            let n = ctrl_node.commissioningController.connectNode(req.params.did);
            let d = n.getDevices()
            cmds = d[0].getClusterClientById(req.params.clid).commands
            res.send(Object.keys(cmds))
        }
        else {
            res.sendStatus(404);  
        }
    })
    // List Attributes
    RED.httpAdmin.get('/_mattercontroller/:cid/device/:did/cluster/:clid/attributes', RED.auth.needsPermission('admin.write'), function(req,res){
        let ctrl_node = RED.nodes.getNode(req.params.cid)
        if (ctrl_node){
            let n = ctrl_node.commissioningController.connectNode(req.params.did);
            let d = n.getDevices()
            atrs = d[0].getClusterClientById(req.params.clid).attributes
            res.send(Object.keys(cmds))
        }
        else {
            res.sendStatus(404);  
        }
    })


}


