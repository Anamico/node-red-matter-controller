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
            _bridge = false
            _method = RED.util.evaluateNodeProperty(config.method, config.methodType, node, msg);
            _code = RED.util.evaluateNodeProperty(config.code, config.codeType, node, msg);
            _deviceid = RED.util.evaluateNodeProperty(config.deviceid, config.deviceidType, node, msg);
            _id = _deviceid.toString().split('-')[0]
            _ep = _deviceid.toString().split('-')[1] //|| 1 //Default to EP 1
            _label = RED.util.evaluateNodeProperty(config.label, config.labelType, node, msg);
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
                    if (re.test(_code)) {
                        pcData = QrPairingCodeCodec.decode(_code)[0]
                    } else {
                        pcData = ManualPairingCodeCodec.decode(_code);
                    }
                    node.debug(pcData)
                    let options = {
                        commissioning :{
                            regulatoryLocation: 2
                        },
                        discovery: {
                            identifierData:
                                pcData.discriminator !== undefined
                                ? { longDiscriminator : pcData.discriminator }
                                : shortDiscriminator !== undefined
                                  ? { shortDiscriminator :  pcData.shortDiscriminator }
                                  : {},
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
                            info.setNodeLabelAttribute(_label).then(() => {
                                node.log(`Commissioned ${_label} as nodeId ${nodeId}`)
                                if (typeof(msg.payload) != 'object') {msg.payload = {}}
                                msg.payload.id = nodeId
                                msg.payload.label = _label
                                node.send(msg)
                                node.status({})
                            }).catch((error) => {node.error(error); node.status({})})
                        }).catch((error) => {node.error(error); node.status({})})
                    }).catch((error) => {node.error(error); node.status({})})
                    break;
                case 'decommissionDevice':
                    node.controller.commissioningController.connectNode(BigInt(_id))
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
                    node.controller.commissioningController.connectNode(BigInt(_id))
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
                    node.controller.commissioningController.connectNode(BigInt(_id))
                        .then((conn) => {
                            if (typeof(msg.payload) != 'object') {msg.payload = {}}
                            msg.payload.id = _id
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
                    node.controller.commissioningController.connectNode(BigInt(_id))
                        .then((conn) => {
                            let endpoints = conn.getDevices()
                            if (endpoints[0].deviceType == 14) { //Bridge
                                ep = conn.getDeviceById(Number(_ep))
                                bridgedinfo = ep.getClusterClientById(57)
                                bridgedinfo.setNodeLabelAttribute(_label).then(() => {
                                    node.log(`Renamed ${_id} as  ${_label}`)
                                    if (typeof(msg.payload) != 'object') {msg.payload = {}}
                                    msg.payload.id = _id
                                    msg.payload.label = _label
                                    node.send(msg)
                                    node.status({})
                                })
                                .catch((error) => {node.error(error); node.status({})})
                            } else { //Not Bridge
                                info = conn.getRootClusterClient(BasicInformationCluster)
                                info.setNodeLabelAttribute(_label).then(() => {
                                node.log(`Renamed ${_id} as ${_label}`)
                                if (typeof(msg.payload) != 'object') {msg.payload = {}}
                                msg.payload.id = _id
                                msg.payload.label = _label
                                node.send(msg)
                                node.status({})
                                })
                                .catch((error) => {node.error(error); node.status({})})
                            }
                            
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

