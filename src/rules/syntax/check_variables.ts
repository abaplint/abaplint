import {Registry} from "../../registry";
import {SyntaxLogic} from "../../abap/syntax/syntax";
import {BasicRuleConfig} from "../_basic_rule_config";
import {IObject} from "../../objects/_iobject";
import {ABAPObject} from "../../objects/_abap_object";

/** Enables variable resolution */
export class CheckVariablesConf extends BasicRuleConfig {
}

export class CheckVariables {

  private conf = new CheckVariablesConf();

  public getKey(): string {
    return "check_variables";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckVariablesConf) {
    this.conf = conf;
  }

  public run(obj: IObject, reg: Registry) {

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    return new SyntaxLogic(reg, obj).findIssues();
  }

}