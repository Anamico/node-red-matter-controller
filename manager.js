const { Environment, Logger, singleton, StorageService, Time } = require( "@matter/main");
const { BasicInformationCluster, DescriptorCluster, GeneralCommissioning, OnOff } = require( "@matter/main/clusters");
const { nodeId } = require("@matter/main/model");
const { ClusterClientObj, ControllerCommissioningFlowOptions } = require("@matter/main/protocol") 
const { ManualPairingCodeCodec, QrPairingCodeCodec, NodeId } = require("@matter/main/types")


//Some parts of the controller are still in the legacy packages
var { CommissioningController, NodeCommissioningOptions } =  require("@project-chip/matter.js")
var { NodeStates } =  require("@project-chip/matter.js/device")


module.exports =  function(RED) {
    function MatterManager(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.method = config.method
        node.controller = RED.nodes.getNode(config.controller);
        this.on('input', function(msg) {
            switch (node.method) {
                case 'commisionDevice':
                    let longDiscriminator = undefined
                    let shortDiscriminator = undefined
                    let re = new RegExp("MT:.*")
                    let pcData
                    if (re.test(msg.payload.code)) {
                        pcData = QrPairingCodeCodec.decode(msg.payload.code)[0]
                    } else {
                        pcData = ManualPairingCodeCodec.decode(msg.payload.code);
                    }
                    let options = {
                        commissioning :{
                            regulatoryLocation: 2
                        },
                        discovery: {
                            identifierData:
                                { shortDiscriminator : pcData.shortDiscriminator } ,
                            discoveryCapabilities: {
                                ble : false,
                            },
                        },
                        passcode: pcData.passcode,
                    }
                    node.controller.commissioningController.commissionNode(options).then((nodeId) => {
                        node.controller.commissioningController.connectNode(nodeId)
                        .then((conn) => {
                            info = conn.getRootClusterClient(BasicInformationCluster)
                            info.setNodeLabelAttribute(msg.payload.label).then(() => {
                                node.log(`Commissioned ${msg.payload.label} as nodeId ${nodeId}`)
                                msg.payload = nodeId
                                msg.send()
                            })
                        })
                    })
                    break;
                case 'decommisionDevice':
                    break;
                case 'ping':
                    break;
                case 'openCommissioning':
                    break;
                case 'getDevice':
                    break
                default:
                    node.error('Unknown Method')
                    break;
            }
        })
    }
    
    RED.nodes.registerType("mattermanager",MatterManager);
}

