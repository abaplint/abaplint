import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {Registry} from "../../registry";
import {CheckVariablesLogic} from "../../abap/syntax/check_variables";
import {Issue} from "../../issue";

export class CheckVariablesConf {
  public enabled: boolean = false;
}

export class CheckVariables extends ABAPRule {

  private conf = new CheckVariablesConf();

  public getKey(): string {
    return "syntax_check";
  }

  public getDescription(): string {
    return "Syntax check";
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