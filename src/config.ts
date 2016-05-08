import "../typings/main.d.ts";
import * as Rules from "./rules/";
import * as path from "path";
import * as fs from "fs";

export default class Config {

    private config = undefined;

    public static get_default(): string {
        let defaults: Array<string> = [];

        for (let key in Rules) {
            let rule = new Rules[key]();
            defaults.push("\"" + rule.get_key() + "\": " + JSON.stringify(rule.get_config()));
        }

        return "{\"rules\":\n{" + defaults.join(",\n") + "\n}}";
    }

    public constructor(filename: string) {
        this.search_config(path.dirname(process.cwd() + path.sep + filename) + path.sep);
        if (this.config === undefined) {
            this.set(Config.get_default());
        }
    }

    public read_by_key(rule: string, key: string) {
        return this.config["rules"][rule][key];
    }

    public read_by_rule(rule: string) {
        return this.config["rules"][rule];
    }

    public set(json: string) {
        this.config = JSON.parse(json);
    }

    private search_config(dir: string) {
        if (typeof fs.existsSync !== "function") {
// make sure the code also works in web browser
            return;
        }

        let file = dir + "abaplint.json";
        if (fs.existsSync(file)) {
            let json = fs.readFileSync(file, "utf8");
            this.set(json);
            return;
        }

        let up = path.normalize(dir + ".." + path.sep);
        if (path.normalize(up) !== dir) {
            this.search_config(up);
        }
    }
}