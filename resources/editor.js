
var ctrl_node = undefined
var device = undefined
var cluser = undefined

const simpleClusters = ['3', '6', '8', '69', '1024', '1026', '768', '512', '513', '514', '257']
const simpleCommands = {
    '3' : ["identify"],
    '6' : ["off", "on", "toggle"],
    '8' : ["moveToLevel"],
    '768' : ["moveToHue",  "moveToSaturation", "moveToColorTemperature"]
} 
const simpleAtrributes = []

function getDevices() {
    ctrl_node = this.value
    if (ctrl_node != '_ADD_' || ctrl_node != undefined){
        url =`_mattercontroller/${ctrl_node}/devices`
        $.get(url, function(r) {
            var devices = document.getElementById("node-input-device");
            removeOptions(devices)
            var option = document.createElement("option");
            option.text = '--SELECT--'
            option.value = '__SELECT__'
            devices.add(option)
            Object.keys(r).forEach(d => {
                var option = document.createElement("option");
                option.text = r[d]
                option.value = d
                devices.add(option); 
            });  
        })
    }
}

function getClusters(){
    device = this.value
    let simpleMode = document.getElementById("node-input-simpleMode")
    if ((ctrl_node != '_ADD_' || ctrl_node != undefined) && (device != undefined || device != '__SELECT__')){
        url =`_mattercontroller/${ctrl_node}/device/${device}/clusters`
        $.get(url, function(r) {
            var clusters = document.getElementById("node-input-cluster");
            removeOptions(clusters)
            var option = document.createElement("option");
            option.text = '--SELECT--'
            option.value = undefined
            clusters.add(option)
            Object.keys(r).forEach(d => {
                if (simpleMode.checked){
                    if (simpleClusters.includes(d)) {
                        var option = document.createElement("option");
                        option.text = r[d]
                        option.value = d
                        clusters.add(option);
                    }
                } else {
                    var option = document.createElement("option");
                    option.text = r[d]
                    option.value = d
                    clusters.add(option);
                }
            });
            
        })
    }
}

function getCommands(){
    cluster = this.value
    let simpleMode = document.getElementById("node-input-simpleMode")
    if ((ctrl_node != '_ADD_' || ctrl_node != undefined) && (device != undefined || device != '__SELECT__') && (cluster != undefined || cluster != '__SELECT__')){
        url =`_mattercontroller/${ctrl_node}/device/${device}/cluster/${cluster}/commands`
        $.get(url, function(r) {
            var commands = document.getElementById("node-input-command");
            removeOptions(commands)
            var option = document.createElement("option");
            option.text = '--SELECT--'
            option.value = undefined
            commands.add(option)
            r.forEach(d => {
                console.log(d)
                if (simpleMode.checked){
                    if (simpleCommands[cluster].includes(d)) {
                        var option = document.createElement("option");
                        option.text = d
                        option.value = d
                        commands.add(option);
                    }
                } else {
                    var option = document.createElement("option");
                    option.text = d
                    option.value = d
                    commands.add(option);
                }
            });
            
        })
    }
}


function removeOptions(selectElement) {
   var i, L = selectElement.options.length - 1;
   for(i = L; i >= 0; i--) {
      selectElement.remove(i);
   }
}


