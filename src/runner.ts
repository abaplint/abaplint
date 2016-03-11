import File from "./file";
import Config from "./config";
import * as Rules from "./rules/";
import Lexer from "./lexer";
import Parser from "./parser";

export default class Runner {

    private static conf: Config;

    public static run(files: Array<File>) {
        this.conf = new Config(files[0].get_filename());

        this.prioritize_files(files).forEach((o) => { this.analyze(o); });
    }

    private static prioritize_files(files: Array<File>): Array<File> {
        let order: Array<File> = [];

        files.forEach((file) => { if (/\.type\.abap$/.test(file.get_filename())) { order.push(file); } });
        files.forEach((file) => { if (order.indexOf(file) === -1 ) { order.push(file); } });

        return order;
    }

    private static analyze(file: File) {
        new Lexer(file);
        new Parser(file);

        for (let key in Rules) {
            let rule = new Rules[key]();
            if (this.conf.read_by_key(rule.get_key(), "enabled") === true) {
                rule.run(file);
            }
        }
    }
}