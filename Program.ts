import xmlreader = require("xmlreader");
import xml2js = require('xml2js');
import fs = require("fs");
import JsonExporter from "./JsonExporter";
import Config from "./Config";
import TsDefineExporter from "./TsDefineExporter";
import JsonFixed from "./JsonFixed";
class Program {
    constructor() {
        this.runAll();
    }
    private runAll() {
        this.clearFolder(Config.JSON_FILE_PATH);
        this.clearFolder(Config.TS_FILE_PATH);
        this.travel(Config.XML_FILE_PATH, this.runXml);
    }
    private runXml(file) {
        let parser = new xml2js.Parser();   //xml -> json
        let filepath = Config.XML_FILE_PATH + file; 
        let fileName = file.split('.')[0];
        fs.readFile(filepath, (err, data)=> {
            parser.parseString(data, (err, result)=> {
                JsonFixed.fixed(result);
                // 导出json文件 ============================================
                JsonExporter.export(fileName, JsonFixed.jsonData);
                // 导出typescript文件 ============================================
                TsDefineExporter.export(fileName, JsonFixed.types);
            })
        })
    }
    /**遍历文件 */
    private travel(src, callback) {
        let self = this;
        // 读取目录
        fs.readdir(src, (err, paths) => {
            if(err) throw err;
            paths.forEach(function(path){
                let _src=src + path;
                
                fs.stat(_src,function(err,st){
                    if(err){
                        throw err;
                    }
                    
                    if(st.isFile()){
                        // 不处理临时文件
                        if(path.indexOf('~$') != 0) {
                            callback(path);
                        }
                    }else if(st.isDirectory()){
                        self.travel(_src, callback);
                    }
                });
            });
        });

    }
    // 清空文件夹
    private clearFolder(path) {
        let files = [];
        let self = this;
        if( fs.existsSync(path) ) {
            files = fs.readdirSync(path);
            files.forEach(function(file,index){
                let curPath = path + "/" + file;
                if(fs.statSync(curPath).isDirectory()) { // recurse
                    self.clearFolder(curPath);
                    fs.rmdirSync(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            
        }
    }
}
new Program();