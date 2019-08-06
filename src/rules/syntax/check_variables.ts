import {Registry} from "../../registry";
import {CheckVariablesLogic} from "../../abap/syntax/check_variables";
import {BasicRuleConfig} from "../_basic_rule_config";
import {IObject} from "../../objects/_iobject";
import {ABAPObject} from "../../objects/_abap_object";

export class CheckVariablesConf extends BasicRuleConfig {
  public errorNamespace: string = "^(Z|Y)";
  public globalConstants: string[] = [];
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
    let ens = this.getConfig().errorNamespace;
    if (ens === undefined) {
      ens = new CheckVariablesConf().errorNamespace;
    }

    return new CheckVariablesLogic(reg, obj, ens, this.conf.globalConstants).findIssues();
  }

}