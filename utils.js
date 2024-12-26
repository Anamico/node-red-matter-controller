
var Models = require( "@matter/main/model")


function deCap(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}


function commandOptions(clusterName, commandName){
    data = {}
    cluster = eval('Models.'+clusterName)
    cluster.commands.forEach((cmd, i) => {
        if (cmd.name == commandName){
            let vars = cluster.commands[i].children.flat()
            vars.forEach(f => {
                console.log(f)
                let key = deCap(f.name)
                let val
                if ('default' in f){
                    console.log('default')
                    val = f.default
                } else if 
                ('constraint' in f && f.constraint != 'all'){
                    console.log('constraint')
                    val = `[${f.constraint}]`
                } else if 
                ('type' in f){
                    console.log('type')
                    val = `[${f.type}]`
                } else {
                    console.log('NULL')
                    val = ''
                }
                data[key] = val
                console.log(key)
            });
        }
    });
    return data
}

module.exports = {commandOptions}