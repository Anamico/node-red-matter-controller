
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

module.exports = {commandOptions}