
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
const simpleAttributes = {
    '3' : ["identifyTime"],
    '6' : ["onOff", "onTime", "offWaitTime", "startUpOnOff"],
    '8' : ["currentLevel", "maxLevel", "minLevel", ],
    '768' : ["currentMode",  "currentHue", "currentSaturation", "colorTemperatureMireds"]
}

function getDevices() {
    //console.log('getDevices')
    ctrl_node = document.getElementById('node-input-controller').value
    if (!(ctrl_node == undefined || ctrl_node == '_ADD_')){
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
                option.id = d
                devices.add(option); 
            });  
        })
    }
}

function setDevice(ctrl_node, device) {
    //console.log(`setDevice , ${ctrl_node}, ${device}`)
    if (ctrl_node != '_ADD_'){
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
                option.id = d
                if (device == d) { option.selected=true}
                devices.add(option); 
            });  
        })
    }
}



function getClusters(){
    //console.log('getClusters')
    ctrl_node = document.getElementById('node-input-controller').value
    device = document.getElementById('node-input-device').value
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
                        option.id = d
                        clusters.add(option);
                    }
                } else {
                    var option = document.createElement("option");
                    option.text = r[d]
                    option.value = d
                    option.id = d
                    clusters.add(option);
                }
            });            
        })
    }
}

function setCluster(ctrl_node, device, cluster){
    //console.log(`setCluster , ${ctrl_node}, ${device}, ${cluster}`)
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
                        option.id = d
                        if (cluster == d) { option.selected=true}
                        clusters.add(option);
                    }
                } else {
                    var option = document.createElement("option");
                    option.text = r[d]
                    option.value = d
                    option.id = d
                    if (cluster == d) { option.selected=true}
                    clusters.add(option);
                }
            });            
        })
    }
}


function getCommands(){
    //console.log('getCommands')
    ctrl_node = document.getElementById('node-input-controller').value
    device = document.getElementById('node-input-device').value
    cluster = document.getElementById('node-input-cluster').value
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
                if (simpleMode.checked){
                    if (simpleCommands[cluster].includes(d)) {
                        var option = document.createElement("option");
                        option.text = d
                        option.value = d
                        option.id = d
                        commands.add(option);
                    }
                } else {
                    var option = document.createElement("option");
                    option.text = d
                    option.value = d
                    option.id = d
                    commands.add(option);
                }
            });
        })
    }
}
function setCommand(ctrl_node, device, cluster, command){
    //console.log(`setCommand , ${ctrl_node}, ${device}, ${cluster}, ${command}`)
    let simpleMode = document.getElementById("node-input-simpleMode")
    if ((ctrl_node != '_ADD_' || ctrl_node != undefined) || (device != undefined || device != '__SELECT__') && (cluster != undefined || cluster != '__SELECT__')){
        url =`_mattercontroller/${ctrl_node}/device/${device}/cluster/${cluster}/commands`
        $.get(url, function(r) {
            var commands = document.getElementById("node-input-command");
            removeOptions(commands)
            var option = document.createElement("option");
            option.text = '--SELECT--'
            option.value = undefined
            commands.add(option)
            r.forEach(d => {
                if (simpleMode.checked){
                    if (simpleCommands[cluster].includes(d)) {
                        var option = document.createElement("option");
                        option.text = d
                        option.value = d
                        option.id = d
                        if (command == d) { option.selected=true}
                        commands.add(option);
                    }
                } else {
                    var option = document.createElement("option");
                    option.text = d
                    option.value = d
                    option.id = d
                    if (command == d) { option.selected=true}
                    commands.add(option);
                }
            });
        })
        getCommandOpts()
    }
    
}

function getAttributes(writable=false){
    console.log('getAttributes')
    ctrl_node = document.getElementById('node-input-controller').value
    device = document.getElementById('node-input-device').value
    cluster = document.getElementById('node-input-cluster').value
    let simpleMode = document.getElementById("node-input-simpleMode")
    if ((ctrl_node != '_ADD_' || ctrl_node != undefined) && (device != undefined || device != '__SELECT__') && (cluster != undefined || cluster != '__SELECT__')){
        if (writable){
            url =`_mattercontroller/${ctrl_node}/device/${device}/cluster/${cluster}/attributes_writable`
        } else{
            url =`_mattercontroller/${ctrl_node}/device/${device}/cluster/${cluster}/attributes`
        }
        $.get(url, function(r) {
            var attrs = document.getElementById("node-input-attr");
            removeOptions(attrs)
            var option = document.createElement("option");
            option.text = '--SELECT--'
            option.value = undefined
            attrs.add(option)
            r.forEach(d => {
                if (simpleMode.checked){
                    if (simpleAttributes[cluster].includes(d)) {
                        var option = document.createElement("option");
                        option.text = d
                        option.value = d
                        option.id = d
                        attrs.add(option);
                    }
                } else {
                    var option = document.createElement("option");
                    option.text = d
                    option.value = d
                    option.id = d
                    attrs.add(option);
                }
            });
        })
    }
}
function setAttribute(ctrl_node, device, cluster, attr, writable=false){
    console.log(`setAttribute , ${ctrl_node}, ${device}, ${cluster}, ${attr}`)
    let simpleMode = document.getElementById("node-input-simpleMode")
    if ((ctrl_node != '_ADD_' || ctrl_node != undefined) || (device != undefined || device != '__SELECT__') && (cluster != undefined || cluster != '__SELECT__')){
        if (writable){
            url =`_mattercontroller/${ctrl_node}/device/${device}/cluster/${cluster}/attributes_writable`
        } else{
            url =`_mattercontroller/${ctrl_node}/device/${device}/cluster/${cluster}/attributes`
        }
        $.get(url, function(r) {
            var attrs = document.getElementById("node-input-attr");
            removeOptions(attrs)
            var option = document.createElement("option");
            option.text = '--SELECT--'
            option.value = undefined
            attrs.add(option)
            r.forEach(d => {
                if (simpleMode.checked){
                    if (simpleAttributes[cluster].includes(d)) {
                        var option = document.createElement("option");
                        option.text = d
                        option.value = d
                        option.id = d
                        if (attr == d) { option.selected=true}
                        attrs.add(option);
                    }
                } else {
                    var option = document.createElement("option");
                    option.text = d
                    option.value = d
                    option.id = d
                    if (attr == d) { option.selected=true}
                    attrs.add(option);
                }
            });
        })
    }
    
}


function getCommandOpts(){
    let clusterID = document.getElementById("node-input-cluster").value
    let command = document.getElementById("node-input-command").value
    url = `_mattermodel/cluster/${clusterID}/command/${command}/options`
    $.get(url, function(r) {
        document.getElementById('sample-data').innerHTML=JSON.stringify(r, null, 2)
    })
}

function getAttributeOpts(){
    console.log(`getAttributeOpts`)
    let clusterID = document.getElementById("node-input-cluster").value
    let attribute = document.getElementById("node-input-attr").value
    url = `_mattermodel/cluster/${clusterID}/attribute/${attribute}/options`
    $.get(url, function(r) {
        let details = r.details
        delete(r.details)
        document.getElementById('sample-data').innerHTML=JSON.stringify(r, null, 2)
        document.getElementById('sample-details').innerHTML=details
    })
}


function removeOptions(selectElement) {
   var i, L = selectElement.options.length - 1;
   for(i = L; i >= 0; i--) {
      selectElement.remove(i);
   }
}
