const { Environment, Logger, singleton, StorageService, Time } = require( "@matter/main");
const { BasicInformationCluster, DescriptorCluster, GeneralCommissioning, OnOff } = require( "@matter/main/clusters");
const { ClusterClientObj, ControllerCommissioningFlowOptions } = require("@matter/main/protocol") 
const { ManualPairingCodeCodec, QrPairingCodeCodec, NodeId } = require("@matter/main/types")


//Some parts of the controller are still in the legacy packages
var { CommissioningController, NodeCommissioningOptions } = await import("@project-chip/matter.js")
var { NodeStates } = await import("@project-chip/matter.js/device")



module.exports =  function(RED) {
    function MatterBridge(config) {
        RED.nodes.createNode(this, config);
        var node = this;
    }
}