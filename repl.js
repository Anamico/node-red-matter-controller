var { Environment, Logger, singleton, StorageService, Time } = await import( "@matter/main");
var { BasicInformationCluster, DescriptorCluster, GeneralCommissioning, OnOff, LevelControl} = await import( "@matter/main/clusters");
var { ClusterClientObj, ControllerCommissioningFlowOptions } = await import("@matter/main/protocol") 
var { ManualPairingCodeCodec, QrPairingCodeCodec, NodeId } = await import("@matter/main/types")

//Some parts of the controller are still in the legacy packages
var { CommissioningController, NodeCommissioningOptions } = await import("@project-chip/matter.js")
var { NodeStates } = await import("@project-chip/matter.js/device")

const logger = Logger.get("Controller");
const environment = Environment.default;

Logger.defaultLogLevel = 4;

const commissioningController = new CommissioningController({
    environment: {
        environment,
        id: "controller-9999",
    },
    autoConnect: true,
});

await commissioningController.start();
let longDiscriminator = undefined
let shortDiscriminator = undefined


var nodes = commissioningController.getCommissionedNodes();
var conn = await commissioningController.connectNode(nodes[0])    
var devices = conn.getDevices()
var info = conn.getRootClusterClient(BasicInformationCluster)
var clc = devices[0].getClusterClientById(6)




