import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {BasicRuleConfig} from "./_basic_rule_config";
import {RuleTag} from "./_irule";

export class MixReturningConf extends BasicRuleConfig {
}

export class MixReturning extends ABAPRule {

  private conf = new MixReturningConf();

  public getMetadata() {
    return {
      key: "mix_returning",
      title: "Mix of returning and exporting",
      shortDescription: `Checks that methods don't have a mixture of returning and exporting/changing parameters`,
      // eslint-disable-next-line max-len
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#use-either-returning-or-exporting-or-changing-but-not-a-combination`,
      tags: [RuleTag.Styleguide],
    };
  }

  private getMessage(): string {
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
        const issue = Issue.atToken(file, token, this.getMessage(), this.getMetadata().key, this.conf.severity);
        ret.push(issue);
      }
    }

    return ret;
  }

}

