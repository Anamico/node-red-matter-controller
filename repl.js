var { Environment, Logger, singleton, StorageService, Time } = await import( "@matter/main");
var { BasicInformationCluster, DescriptorCluster, GeneralCommissioning, OnOff, LevelControl, BridgedDeviceBasicInformationCluster} = await import( "@matter/main/clusters");
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

async function commissionDevice(pc){
    let re = new RegExp("MT:.*")
    let pcData
    if (re.test(pc)) {
        pcData = QrPairingCodeCodec.decode(pc)[0]
    } else {
        pcData = ManualPairingCodeCodec.decode(pc);
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
        const nodeId = await commissioningController.commissionNode(options);
        console.log(`Commissioning successfully done with nodeId ${nodeId}`);
}




var nodes = commissioningController.getCommissionedNodes();
var conn = await commissioningController.connectNode(nodes[2])    
var devices = conn.getDevices()
var info = conn.getRootClusterClient(BasicInformationCluster)
var descriptor = conn.getRootClusterClient(DescriptorCluster);
var parts = await descriptor.attributes.partsList.get()






