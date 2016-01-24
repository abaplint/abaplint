import File from "./file";
import Config from "./config";
import * as Rules from "./rules/";

export default class Runner {

    public static run(files: Array<File>) {
        for (let file of files) {
            this.analyze(file);
        }
    }

    private static analyze(file: File) {
        for (let key in Rules) {
            let rule = new Rules[key]();
            if (Config.read_rule(rule.get_key(), "enabled") === true) {
                rule.run(file);
            }
        }
    }
}