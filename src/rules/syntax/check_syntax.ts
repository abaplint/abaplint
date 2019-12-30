import {Registry} from "../../registry";
import {SyntaxLogic} from "../../abap/syntax/syntax";
import {BasicRuleConfig} from "../_basic_rule_config";
import {IObject} from "../../objects/_iobject";
import {ABAPObject} from "../../objects/_abap_object";
import {Issue} from "../..";

/** Enables syntax check and variable resolution */
export class CheckSyntaxConf extends BasicRuleConfig {
}

export class CheckSyntax {

  private conf = new CheckSyntaxConf();

  public getKey(): string {
    return "check_syntax";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckSyntaxConf) {
    this.conf = conf;
  }

  public run(obj: IObject, reg: Registry): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    return new SyntaxLogic(reg, obj).run().issues;
  }

}