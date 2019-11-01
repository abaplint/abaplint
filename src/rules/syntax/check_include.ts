import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {Registry} from "../../registry";
import {BasicRuleConfig} from "../_basic_rule_config";
import {ABAPObject} from "../../objects/_abap_object";

/** Checks INCLUDE statements */
export class CheckIncludeConf extends BasicRuleConfig {
}

export class CheckInclude extends ABAPRule {

  private conf = new CheckIncludeConf();

  public getKey(): string {
    return "check_include";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckIncludeConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: Registry, _obj: ABAPObject) {
    return reg.getIncludeGraph().getIssuesFile(file);
  }

}