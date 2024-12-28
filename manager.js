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
        node.controller = RED.nodes.getNode(config.controller);
        this.on('input', function(msg) {
            _method = RED.util.evaluateNodeProperty(config.method, config.methodType, node, msg);
            if (!_method) {
                _method=config.methodType
            }
            node.status({fill:"blue",shape:"dot",text:"processing"});
            switch (_method) {
                case 'commissionDevice':
                    let longDiscriminator = undefined
                    let shortDiscriminator = undefined
                    let re = new RegExp("MT:.*")
                    let pcData
                    if (re.test(msg.payload.code)) {
                        pcData = QrPairingCodeCodec.decode(msg.payload.code)[0]
                    } else {
                        pcData = ManualPairingCodeCodec.decode(msg.payload.code);
                    }
                    console.log(pcData)
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
                                msg.payload.id = nodeId
                                node.send(msg)
                                node.status({})
                            }).catch((error) => {node.error(error); node.status({})})
                        }).catch((error) => {node.error(error); node.status({})})
                    }).catch((error) => {node.error(error); node.status({})})
                    break;
                case 'decommissionDevice':
                    node.controller.commissioningController.connectNode(BigInt(msg.payload.id))
                    .then((conn) => {
                        info = conn.getRootClusterClient(BasicInformationCluster)
                        info.getNodeLabelAttribute()
                        .then((label) => {
                            RED.comms.publish("matter_notify", `Remember to remove any events and subscriptons for ${label}`);
                        }).catch((error) => {node.error(error); node.status({})})
                        .then(() =>{
                            conn.decommission()
                            .then(() => {
                                msg.payload = "Device Removed"
                                node.send(msg)
                                node.status({})
                            })
                        }).catch((error) => {node.error(error); node.status({})})
                    }).catch((error) => {node.error(error); node.status({})})
                    break;
                case 'openCommissioning':
                    node.controller.commissioningController.connectNode(BigInt(msg.payload.id))
                    .then((conn) => {
                        conn.openEnhancedCommissioningWindow()
                        .then((codes => {
                            msg.payload = codes
                            node.send(msg)
                            node.status({})
                        })).catch((error) => {node.error(error); node.status({})})
                    }).catch((error) => {node.error(error); node.status({})})
                    break;
                case 'getDevice':
                    node.controller.commissioningController.connectNode(BigInt(msg.payload.id))
                        .then((conn) => {
                            info = conn.getRootClusterClient(BasicInformationCluster)
                            info.getNodeLabelAttribute()
                            .then((label) => {
                                msg.payload.label = label
                            }).catch((error) => {node.error(error); node.status({})})
                            .then(() => {
                                info.getProductNameAttribute()
                                .then((name) => {
                                    msg.payload.productName = name
                                })
                            }).catch((error) => {node.error(error); node.status({})})
                            .then(() => {
                                info.getVendorNameAttribute()
                                .then((vendor) => {
                                    msg.payload.vendorName = vendor
                                })
                            }).catch((error) => {node.error(error); node.status({})})
                            .then(() => {
                                info.getSerialNumberAttribute()
                                .then((serial) => {
                                    msg.payload.serialNumber = serial
                                })
                            }).catch((error) => {node.error(error); node.status({})})
                            .then(() => {
                                node.send(msg)
                                node.status({})
                            })
                            .catch((error) => {node.error(error); node.status({})})
                        })
                        .catch((error) => {node.error(error); node.status({})})
                    break
                case 'listDevices':
                    let nodeIds = node.controller.commissioningController.getCommissionedNodes()
                    msg.payload = nodeIds
                    node.send(msg)
                    node.status({})
                    break
                case 'renameDevice':
                    node.controller.commissioningController.connectNode(BigInt(msg.payload.id))
                        .then((conn) => {
                            info = conn.getRootClusterClient(BasicInformationCluster)
                            info.setNodeLabelAttribute(msg.payload.label).then(() => {
                                node.log(`Renamed ${msg.payload.id} as  ${msg.payload.label}`)
                                node.send(msg)
                                node.status({})
                            })
                            .catch((error) => {node.error(error); node.status({})})
                        })
                        .catch((error) => {node.error(error); node.status({})})
                    break
                default:
                    node.error(`Unknown Method ${_method}`)
                    break;
            }
            
        })
    }
    
    RED.nodes.registerType("mattermanager",MatterManager);
}

