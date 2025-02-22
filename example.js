#!/usr/bin/env node
/**
 * @license
 * Copyright 2022-2024 Matter.js Authors
 * SPDX-License-Identifier: Apache-2.0
 */



import { Environment, Logger, singleton, StorageService, Time } from "@matter/main";
import { BasicInformationCluster, DescriptorCluster, GeneralCommissioning, OnOff } from "@matter/main/clusters";
import { ClusterClientObj, ControllerCommissioningFlowOptions } from "@matter/main/protocol";
import { ManualPairingCodeCodec, NodeId } from "@matter/main/types";

import { CommissioningController, NodeCommissioningOptions } from "@project-chip/matter.js";
import { NodeStates } from "@project-chip/matter.js/device";

const logger = Logger.get("Controller");

const environment = Environment.default;


const storageService = environment.get(StorageService);

console.log(`Storage location: ${storageService.location} (Directory)`);
logger.info(
    'Use the parameter "--storage-path=NAME-OR-PATH" to specify a different storage location in this directory, use --storage-clear to start with an empty storage.',
);

class ControllerNode {
    async start() {
        logger.info(`node-matter Controller started`);

        /**
         * Collect all needed data
         *
         * This block makes sure to collect all needed data from cli or storage. Replace this with where ever your data
         * come from.
         *
         * Note: This example also uses the initialized storage system to store the device parameter data for convenience
         * and easy reuse. When you also do that be careful to not overlap with Matter-Server own contexts
         * (so maybe better not ;-)).
         */

        const controllerStorage = (await storageService.open("controller")).createContext("data");
        const ip = (await controllerStorage.has("ip"))
            ? await controllerStorage.get<string>("ip")
            : environment.vars.string("ip");
        const port = (await controllerStorage.has("port"))
            ? await controllerStorage.get<number>("port")
            : environment.vars.number("port");
        const uniqueId = (await controllerStorage.has("uniqueid"))
            ? await controllerStorage.get<string>("uniqueid")
            : (environment.vars.string("uniqueid") ?? Time.nowMs().toString());
        await controllerStorage.set("uniqueid", uniqueId);




        const pairingCode = environment.vars.string("pairingcode");
        let longDiscriminator, setupPin, shortDiscriminator;
        if (pairingCode !== undefined) {
            const pairingCodeCodec = ManualPairingCodeCodec.decode(pairingCode);
            shortDiscriminator = pairingCodeCodec.shortDiscriminator;
            longDiscriminator = undefined;
            setupPin = pairingCodeCodec.passcode;
            logger.debug(`Data extracted from pairing code: ${Logger.toJSON(pairingCodeCodec)}`);
        } else {
            longDiscriminator =
                environment.vars.number("longDiscriminator") ??
                (await controllerStorage.get("longDiscriminator", 3840));
            if (longDiscriminator > 4095) throw new Error("Discriminator value must be less than 4096");
            setupPin = environment.vars.number("pin") ?? (await controllerStorage.get("pin", 20202021));
        }
        if ((shortDiscriminator === undefined && longDiscriminator === undefined) || setupPin === undefined) {
            throw new Error(
                "Please specify the longDiscriminator of the device to commission with -longDiscriminator or provide a valid passcode with -passcode",
            );
        }

        // Collect commissioning options from commandline parameters
        const commissioningOptions: ControllerCommissioningFlowOptions = {
            regulatoryLocation: GeneralCommissioning.RegulatoryLocationType.IndoorOutdoor,
            regulatoryCountryCode: "XX",
        };

        

        /**
         * Create Matter Server and Controller Node
         *
         * To allow the device to be announced, found, paired and operated we need a MatterServer instance and add a
         * CommissioningController to it and add the just created device instance to it.
         * The Controller node defines the port where the server listens for the UDP packages of the Matter protocol
         * and initializes deice specific certificates and such.
         *
         * The below logic also adds command handlers for commands of clusters that normally are handled internally
         * like testEventTrigger (General Diagnostic Cluster) that can be implemented with the logic when these commands
         * are called.
         */



        const commissioningController = new CommissioningController({
            environment: {
                environment,
                id: uniqueId,
            },
            autoConnect: false,
        });

        /**
         * Start the Matter Server
         *
         * After everything was plugged together we can start the server. When not delayed announcement is set for the
         * CommissioningServer node then this command also starts the announcement of the device into the network.
         */
        await commissioningController.start();

        if (!commissioningController.isCommissioned()) {
            const options = {
                commissioning: commissioningOptions,
                discovery: {
                    knownAddress: ip !== undefined && port !== undefined ? { ip, port, type: "udp" } : undefined,
                    identifierData:
                        longDiscriminator !== undefined
                            ? { longDiscriminator }
                            : shortDiscriminator !== undefined
                              ? { shortDiscriminator }
                              : {},
                    discoveryCapabilities: {
                        ble,
                    },
                },
                passcode: setupPin,
            } as NodeCommissioningOptions;
            logger.info(`Commissioning ... ${Logger.toJSON(options)}`);
            const nodeId = await commissioningController.commissionNode(options);

            console.log(`Commissioning successfully done with nodeId ${nodeId}`);
        }

        /**
         * TBD
         */
        try {
            const nodes = commissioningController.getCommissionedNodes();
            console.log("Found commissioned nodes:", Logger.toJSON(nodes));

            const nodeId = NodeId(environment.vars.number("nodeid") ?? nodes[0]);
            if (!nodes.includes(nodeId)) {
                throw new Error(`Node ${nodeId} not found in commissioned nodes`);
            }

            // Trigger node connection. Returns once process started, events are there to wait for completion
            // By default will subscript to all attributes and events
            const node = await commissioningController.connectNode(nodeId);

            // React on generic events
            node.events.attributeChanged.on(({ path: { nodeId, clusterId, endpointId, attributeName }, value }) =>
                console.log(
                    `attributeChangedCallback ${nodeId}: Attribute ${endpointId}/${clusterId}/${attributeName} changed to ${Logger.toJSON(
                        value,
                    )}`,
                ),
            );
            node.events.eventTriggered.on(({ path: { nodeId, clusterId, endpointId, eventName }, events }) =>
                console.log(
                    `eventTriggeredCallback ${nodeId}: Event ${endpointId}/${clusterId}/${eventName} triggered with ${Logger.toJSON(
                        events,
                    )}`,
                ),
            );
            node.events.stateChanged.on(info => {
                switch (info) {
                    case NodeStates.Connected:
                        console.log(`state changed: Node ${nodeId} connected`);
                        break;
                    case NodeStates.Disconnected:
                        console.log(`state changed: Node ${nodeId} disconnected`);
                        break;
                    case NodeStates.Reconnecting:
                        console.log(`state changed: Node ${nodeId} reconnecting`);
                        break;
                    case NodeStates.WaitingForDeviceDiscovery:
                        console.log(`state changed: Node ${nodeId} waiting for device discovery`);
                        break;
                }
            });
            node.events.structureChanged.on(() => {
                console.log(`Node ${nodeId} structure changed`);
            });

            // Now wait till the structure of the node gor initialized (potentially with persisted data)
            await node.events.initialized;

            // Or use this to wait for full remote initialization and reconnection.
            // Will only return when node is connected!
            // await node.events.initializedFromRemote;

            node.logStructure();

            // Example to initialize a ClusterClient and access concrete fields as API methods
            const descriptor = node.getRootClusterClient(DescriptorCluster);
            if (descriptor !== undefined) {
                console.log(await descriptor.attributes.deviceTypeList.get()); // you can call that way
                console.log(await descriptor.getServerListAttribute()); // or more convenient that way
            } else {
                console.log("No Descriptor Cluster found. This should never happen!");
            }

            // Example to subscribe to a field and get the value
            const info = node.getRootClusterClient(BasicInformationCluster);
            if (info !== undefined) {
                console.log(await info.getProductNameAttribute()); // This call is executed remotely
                //console.log(await info.subscribeProductNameAttribute(value => console.log("productName", value), 5, 30));
                //console.log(await info.getProductNameAttribute()); // This call is resolved locally because we have subscribed to the value!
            } else {
                console.log("No BasicInformation Cluster found. This should never happen!");
            }

            // Example to get all Attributes of the commissioned node: */*/*
            //const attributesAll = await interactionClient.getAllAttributes();
            //console.log("Attributes-All:", Logger.toJSON(attributesAll));

            // Example to get all Attributes of all Descriptor Clusters of the commissioned node: */DescriptorCluster/*
            //const attributesAllDescriptor = await interactionClient.getMultipleAttributes([{ clusterId: DescriptorCluster.id} ]);
            //console.log("Attributes-Descriptor:", JSON.stringify(attributesAllDescriptor, null, 2));

            // Example to get all Attributes of the Basic Information Cluster of endpoint 0 of the commissioned node: 0/BasicInformationCluster/*
            //const attributesBasicInformation = await interactionClient.getMultipleAttributes([{ endpointId: 0, clusterId: BasicInformationCluster.id} ]);
            //console.log("Attributes-BasicInformation:", JSON.stringify(attributesBasicInformation, null, 2));

            const devices = node.getDevices();
            if (devices[0] && devices[0].number === 1) {
                // Example to subscribe to all Attributes of endpoint 1 of the commissioned node: */*/*
                //await interactionClient.subscribeMultipleAttributes([{ endpointId: 1, /* subscribe anything from endpoint 1 */ }], 0, 180, data => {
                //    console.log("Subscribe-All Data:", Logger.toJSON(data));
                //});

                const onOff: ClusterClientObj<OnOff.Complete> | undefined = devices[0].getClusterClient(OnOff.Complete);
                if (onOff !== undefined) {
                    let onOffStatus = await onOff.getOnOffAttribute();
                    console.log("initial onOffStatus", onOffStatus);

                    onOff.addOnOffAttributeListener(value => {
                        console.log("subscription onOffStatus", value);
                        onOffStatus = value;
                    });
                    // read data every minute to keep up the connection to show the subscription is working
                    setInterval(() => {
                        onOff
                            .toggle()
                            .then(() => {
                                onOffStatus = !onOffStatus;
                                console.log("onOffStatus", onOffStatus);
                            })
                            .catch(error => logger.error(error));
                    }, 60000);
                }
            }
        } finally {
            //await matterServer.close(); // Comment out when subscribes are used, else the connection will be closed
            setTimeout(() => process.exit(0), 1000000);
        }
    }
}

new ControllerNode().start().catch(error => logger.error(error));
