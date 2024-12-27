const { Environment, Logger, singleton, StorageService, Time } = require( "@matter/main");
const { BasicInformationCluster, DescriptorCluster, GeneralCommissioning, OnOff } = require( "@matter/main/clusters");
const { ClusterClientObj, ControllerCommissioningFlowOptions } = require("@matter/main/protocol") 
const { ManualPairingCodeCodec, QrPairingCodeCodec, NodeId } = require("@matter/main/types")

//Some parts of the controller are still in the legacy packages
var { CommissioningController, NodeCommissioningOptions } =  require("@project-chip/matter.js")
var { NodeStates } =  require("@project-chip/matter.js/device")

const environment = Environment.default;

module.exports =  function(RED) {
    function MatterController(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.started = false
        node.networkInterface = config.networkInterface 
        switch (config.logLevel) {
            case "FATAL":
                Logger.defaultLogLevel = 5;
                break;
            case "ERROR":
                Logger.defaultLogLevel = 4;
                break;
            case "WARN":
                Logger.defaultLogLevel = 3;
                break;
            case "INFO":
                Logger.defaultLogLevel = 1;
                break;1
            case "DEBUG":
                Logger.defaultLogLevel = 0;
                break;
        }
        Environment.default.vars.set('mdns.networkInterface', node.networkInterface);
        node.commissioningController = new CommissioningController({
            environment: {
                environment,
                //id: node.id
                id: 'controller-9999'
            },
            autoConnect: false,
        })
        node.commissioningController.start().then(() => {node.started = true})
    }
    RED.nodes.registerType("mattercontroller",MatterController);

    
}


