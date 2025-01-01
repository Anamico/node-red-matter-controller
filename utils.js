
var Models = require( "@matter/main/model")


function deCap(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}
function cap(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function commandOptions(clusterID, commandName){
    data = {}
    clusterName = Models.MatterModel.standard.get(Models.ClusterModel, Number(clusterID)).name
    cluster = eval('Models.'+clusterName)
    cluster.commands.forEach((cmd, i) => {
        if (cmd.name == cap(commandName)){
            let vars = cluster.commands[i].children.flat()
            vars.forEach(f => {
                let key = deCap(f.name)
                let val
                if ('default' in f){
                    val = f.default
                } else if 
                ('constraint' in f && f.constraint != 'all'){
                    val = `[${f.constraint}]`
                } else if 
                ('type' in f){
                    val = `[${f.type}]`
                } else {
                    val = ''
                }
                data[key] = val
            });
        }
    });
    return data
}

function attributeOptions(clusterID, attributeName){
    data = {}
    clusterName = Models.MatterModel.standard.get(Models.ClusterModel, Number(clusterID)).name
    cluster = eval('Models.'+clusterName)
    cluster.attributes.forEach((attr, i) => {
        if (attr.name == cap(attributeName)){
            data.name = attr.name
            data.defaut = attr.default || ''
            data.constraint = attr.constraint || ''
            data.type = attr.type
            data.details = attr.details || ''
        }
    })
    return data
}

// Functions to update the simples lists
function listClusters(){
    Models.MatterModel.standard.clusters.forEach((cl) => {
    console.log(`"${cl.id}", // ${cl.name}`)
    })
}

function getCommands(clusterList){
    simpleCommands = {}
    clusterList.forEach((clusterID) => {
        simpleCommands[clusterID] = []
        clusterName = Models.MatterModel.standard.get(Models.ClusterModel, Number(clusterID)).name
        cluster = eval('Models.'+clusterName)
        cluster.commands.forEach((cmd, i) => {
            simpleCommands[clusterID].push(deCap(cmd.name))
        })
    })
    return simpleCommands

}

function getAttributes(clusterList){
    simpleAttributes = {}
    clusterList.forEach((clusterID) => {
        simpleAttributes[clusterID] = []
        clusterName = Models.MatterModel.standard.get(Models.ClusterModel, Number(clusterID)).name
        cluster = eval('Models.'+clusterName)
        cluster.attributes.forEach((attr, i) => {
            simpleAttributes[clusterID].push(deCap(attr.name))
        })
    })
    return simpleAttributes

}


module.exports = {commandOptions, attributeOptions, deCap, cap}