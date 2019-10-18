import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Statements from "../abap/statements";
import * as Expressions from "../abap/expressions";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Checks that methods don't have a mixture of returning and exporting/changing parameters */
export class MixReturningConf extends BasicRuleConfig {
}

export class MixReturning extends ABAPRule {

  private conf = new MixReturningConf();

  public getKey(): string {
    return "mix_returning";
  }

  private getDescription(): string {
    return "Don't mix RETURNING and EXPORTING/CHANGING parameters in a single method.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MixReturningConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const ret: Issue[] = [];
    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    for (const def of stru.findAllStatements(Statements.MethodDef)) {
      if (!def.findFirstExpression(Expressions.MethodDefReturning)) {
        continue;
      }
      if (def.findFirstExpression(Expressions.MethodDefExporting)
          || def.findFirstExpression(Expressions.MethodDefChanging)) {
        const token = def.getFirstToken();
        ret.push(new Issue({file, message: this.getDescription(), key: this.getKey(), start: token.getStart()}));
      }
    }

    return ret;
  }

}

