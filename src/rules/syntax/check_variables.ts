import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {Registry} from "../../registry";
import {CheckVariablesLogic} from "../../abap/syntax/check_variables";
import {Issue} from "../../issue";
import {BasicRuleConfig} from "../_basic_rule_config";

export class CheckVariablesConf extends BasicRuleConfig {
}

export class CheckVariables extends ABAPRule {

  private conf = new CheckVariablesConf();

  public getKey(): string {
    return "check_variables";
  }

  public getDescription(): string {
    return "Check Variables";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckVariablesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: Registry): Issue[] {
    return new CheckVariablesLogic(reg, file).findIssues();
  }

}