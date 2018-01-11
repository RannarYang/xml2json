export default class JsonFixed {
    public static types;
    public static jsonData;
    public static fixed(parseJsonData) {
        delete parseJsonData.root['$'];
        let rootDatas = parseJsonData.root;
        
        // parseNode (经过这一步骤处理后已是可用的json格式) =================================
        let jsonData = {};
        let keys = Object.keys(rootDatas);
        if(keys.length == 1) {
            jsonData = this.parseNode(rootDatas[keys[0]]); 
        } else {
            keys.forEach((key, index)=>{
                jsonData[key] = this.parseNode(rootDatas[key])
            })
        }
        // fixNode (获取统一json数据格式后的types类型) ======================================
        let types = this.types = this.fixType(jsonData);
        // fixJsons (微调json数据) ======================================
        this.jsonData = this.fixJsons(jsonData, types);
    }
    private static parseNode(nodes) {
        let result = [];
        for(let i = 0, len = nodes.length; i < len; i++) {
            let obj = {};
            if(typeof(nodes[i]) == 'string') { // text节点， 统一用 _ 存储
                obj = {_: nodes[i]};
            } else {
                for(let inKey in nodes[i]) {
                    if(inKey == '$') { // 属性节点
                        let attrObj = nodes[i][inKey];
                        for(var attr in attrObj) {
                            obj[attr] = attrObj[attr];
                        }
                    } else if(inKey == '_') {
                        obj = {_: nodes[i][inKey]}; // text节点， 统一用 _ 存储
                    }else {
                        obj[inKey] = this.parseNode(nodes[i][inKey]); // 孩子节点
                    }
                }
            }
            result.push(obj);
        }
        return result.length > 1 ? result : result[0]; // 如果数组中只有一个元素，直接返回该元素，否则返回该数组
    }
    private static fixType(jsonData): Object {
        let types = {};
        let type = typeof(jsonData);
        
        if(type == 'object' && jsonData.length) { // 数组 ===========================
            for(let i = 0, len = jsonData.length; i < len; i++) {
                types = this.extend(types, this.fixType(jsonData[i])); // 递归调用fixtype
            }
        } else if(type == 'object') { // 非数组的对象 =========================
            for(let childKey in jsonData) {
                let typeInner = typeof(jsonData[childKey]);
                if(typeInner == 'object') { // 子元素是对象的时候递归调用fixtype
                    types[childKey] = this.fixType(jsonData[childKey]);
                    if(jsonData[childKey].length) { // 如果是数组的话就用_type属性标记下
                        types[childKey]['_type'] = 'array';
                    }
                } else {
                    types[childKey] = typeInner; // 普通类型直接记录对象类型
                }
            }
        }
        return types;
    }
    private static fixJsons(jsonData, types) {
        for(let i = 0, len = jsonData.length; i < len; i++) {
            let json = jsonData[i];
            jsonData[i] = this.fixJson(json, types);
        }
        return jsonData;
    }
    private static fixJson(json, types) {
        for(let key in json) {
            if(typeof json[key] == 'object' && types && types[key]) {
                this.fixJson(json[key], types[key]);
            }
            if(types && types[key] && !json[key].length && types[key]['_type'] == 'array') {
                json[key] = [json[key]];
            }
        }
        return json;
    }
    // 合并对象
    private static extend(target, source) {
        for (var obj in source) {
            target[obj] = source[obj];
        }
        return target;
    }
}