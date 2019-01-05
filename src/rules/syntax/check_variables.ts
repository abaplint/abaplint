import {Registry} from "../../registry";
import {CheckVariablesLogic} from "../../abap/syntax/check_variables";
import {BasicRuleConfig} from "../_basic_rule_config";
import {IObject} from "../../objects/_iobject";
import {ABAPObject} from "../../objects/_abap_object";

export class CheckVariablesConf extends BasicRuleConfig {
//  public enabled = false;
}

export class CheckVariables {

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

  public run(obj: IObject, reg: Registry) {

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    return new CheckVariablesLogic(reg, obj).findIssues();
  }

}