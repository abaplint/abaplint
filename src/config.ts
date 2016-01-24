import * as Rules from "./rules/";

export default class Config {

    private static config = undefined;

    public static read_rule(rule: string, key: string) {
        if (this.config === undefined) {
            this.set(this.get_default());
        }
        return this.config["rules"][rule][key];
    }

    public static set(json: string) {
        this.config = JSON.parse(json);
    }

    public static get_default(): string {
        let defaults: Array<string> = [];

        for (let key in Rules) {
            let rule = new Rules[key]();
            defaults.push("\"" + rule.get_key() + "\": " + JSON.stringify(rule.default_config()));
        }

        return "{ \"rules\": {" + defaults.join() + "}}";
    }

}