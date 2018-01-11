import fs = require('fs');
import Config from "./Config";
import JsonExporter from './JsonExporter';
export default class TsDefineExporter {
    
    public static export(fileName: string, types) {
        let tsTemplate = this.getTemplateFromTypes(fileName, types);
        let outputFilename = Config.TS_FILE_PATH + fileName + '.ts';
        this.saveToFile(outputFilename, tsTemplate);
    }
    private static getTemplateFromTypes(fileName, types) {
        let field = ``;
        for(let key in types) {
            if(typeof(types[key]) == 'object') {
                field += this.getField(key,  this.fixTypeString(types[key]));
            } else {
                field += this.getField(key, types[key]);
            }
            
        }
        return `class ${fileName} {${field}\n}`
    }
    private static fixTypeString(type) {
        let result: string = '';
        
        let isArr = false;
        if(type['_type']) {
            delete type['_type'];
            isArr = true;
        }
        for(let key in type) {
            if(typeof(type[key]) == 'object') {
                result += key + ":" + this.fixTypeString(type[key]) + ',';
            } else { 
                result += key + ':' + type[key] + ',';
            }
        }
        if(Object.keys.length) {
            result = result.slice(0, result.length - 1);
        }
        if(isArr) {
            return `{${result}}[]`
        } else {
            return `{${result}}`
        }
    }
    private static saveToFile(filePath, data: string) {
        fs.writeFile(filePath, data, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("TS saved to " + filePath);
            }
        });
    }
    private static getField(header, type) {
        return `\n    public ${header}: ${type}; `;
    }
}
