import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {BasicRuleConfig} from "./_basic_rule_config";
import {RuleTag} from "./_irule";

export class PreferReturningToExportingConf extends BasicRuleConfig {
}

export class PreferReturningToExporting extends ABAPRule {

  private conf = new PreferReturningToExportingConf();

  public getMetadata() {
    return {
      key: "prefer_returning_to_exporting",
      title: "Prefer RETURNING to EXPORTING",
      shortDescription: `Prefer RETURNING to EXPORTING. Generic types cannot be RETURNING.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#prefer-returning-to-exporting
https://docs.abapopenchecks.org/checks/44/`,
      tags: [RuleTag.Styleguide],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PreferReturningToExportingConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const ret: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    for (const def of stru.findAllStatements(Statements.MethodDef)) {
      if (def.findFirstExpression(Expressions.MethodDefChanging)) {
        continue;
      }

      const exporting = def.findFirstExpression(Expressions.MethodDefExporting);
      if (exporting === undefined) {
        continue;
      }

      const returning = def.findFirstExpression(Expressions.MethodDefReturning);
      if (returning !== undefined) {
        continue;
      }

      const params = exporting.findDirectExpressions(Expressions.MethodParam);
      if (params.length !== 1) {
        continue;
      }

      const concat = params[0].concatTokens().toUpperCase();

      if (concat.endsWith("TYPE ANY")
          || concat.endsWith("TYPE ANY TABLE")
          || concat.endsWith("TYPE C")
          || concat.endsWith("TYPE CLIKE")
          || concat.endsWith("TYPE CSEQUENCE")
          || concat.endsWith("TYPE DATA")
          || concat.endsWith("TYPE DECFLOAT")
          || concat.endsWith("TYPE HASHED TABLE")
          || concat.endsWith("TYPE INDEX TABLE")
          || concat.endsWith("TYPE N")
          || concat.endsWith("TYPE NUMERIC")
          || concat.endsWith("TYPE OBJECT")
          || concat.endsWith("TYPE P")
          || concat.endsWith("TYPE SIMPLE")
          || concat.endsWith("TYPE SORTED TABLE")
          || concat.endsWith("TYPE STANDARD TABLE")
          || concat.endsWith("TYPE TABLE")
          || concat.endsWith("TYPE X")
          || concat.endsWith("TYPE XSEQUENCE")) {
        continue;
      }

      const token = params[0].getFirstToken();
      const issue = Issue.atToken(file, token, "Prefer RETURNING to EXPORTING", this.getMetadata().key, this.conf.severity);
      ret.push(issue);
    }

    return ret;
  }

}

