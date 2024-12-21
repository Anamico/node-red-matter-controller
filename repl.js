var { Environment, Logger, singleton, StorageService, Time } = await import( "@matter/main");
var { BasicInformationCluster, DescriptorCluster, GeneralCommissioning, OnOff } = await import( "@matter/main/clusters");
var { ClusterClientObj, ControllerCommissioningFlowOptions } = await import("@matter/main/protocol") 
var { ManualPairingCodeCodec, QrPairingCodeCodec, NodeId } = await import("@matter/main/types")

//Some parts of the controller are still in the legacy packages
var { CommissioningController, NodeCommissioningOptions } = await import("@project-chip/matter.js")
var { NodeStates } = await import("@project-chip/matter.js/device")

const logger = Logger.get("Controller");
const environment = Environment.default;

const commissioningController = new CommissioningController({
    environment: {
        environment,
        id: "controller-9999",
    },
    autoConnect: false,
});

await commissioningController.start();
let longDiscriminator = undefined
let shortDiscriminator = undefined

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