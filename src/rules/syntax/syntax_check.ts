import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {Registry} from "../../registry";
import {CheckVariables} from "../../abap/syntax/check_variables";
import {Issue} from "../../issue";

export class SyntaxCheckConf {
  public enabled: boolean = true;
}

export class SyntaxCheck extends ABAPRule {

  private conf = new SyntaxCheckConf();

  public getKey(): string {
    return "syntax_check";
  }

  public getDescription(): string {
    return "Syntax check";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SyntaxCheckConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: Registry): Issue[] {
    return new CheckVariables().run(file);
  }

}