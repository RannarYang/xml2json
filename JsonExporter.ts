import fs = require('fs');
import Config from "./Config";
export default class JsonExporter {
    public static export(fileName, jsonData) {
        let outputFilename = Config.JSON_FILE_PATH + fileName + '.json';
        this.saveToFile(outputFilename, jsonData);
    }
    
    private static saveToFile(filePath, data: Object) {
        fs.writeFile(filePath, JSON.stringify(data, null, 4), function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("JSON saved to " + filePath);
            }
        });
    }
    
}
