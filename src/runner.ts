import File from "./file";
import Config from "./config";
import * as Rules from "./rules/";
import Lexer from "./lexer";
import Parser from "./parser";

export default class Runner {

    public static run(files: Array<File>) {
// prioritize file types
        let order: Array<File> = [];

        files.forEach((file) => { if (/\.type\.abap$/.test(file.get_filename())) { order.push(file); } });
        files.forEach((file) => { if (order.indexOf(file) === -1 ) { order.push(file); } });

        order.forEach((o) => { this.analyze(o); });
    }

    private static analyze(file: File) {
        new Lexer(file);
        new Parser(file);

        for (let key in Rules) {
            let rule = new Rules[key]();
            if (Config.read_rule(rule.get_key(), "enabled") === true) {
                rule.run(file);
            }
        }
    }
}