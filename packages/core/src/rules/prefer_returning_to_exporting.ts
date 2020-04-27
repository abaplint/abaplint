import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {BasicRuleConfig} from "./_basic_rule_config";

export class PreferReturningToExportingConf extends BasicRuleConfig {
}

export class PreferReturningToExporting extends ABAPRule {

  private conf = new PreferReturningToExportingConf();

  public getMetadata() {
    return {
      key: "prefer_returning_to_exporting",
      title: "Prefer RETURNING to EXPORTING",
      quickfix: false,
      shortDescription: `Prefer RETURNING to EXPORTING`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#prefer-returning-to-exporting
https://docs.abapopenchecks.org/checks/44/`,
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
      if (concat.includes("TYPE ANY")
          || concat.includes("TYPE DATA")
          || concat.includes("TYPE ANY TABLE")
          || concat.includes("TYPE INDEX TABLE")
          || concat.includes("TYPE STANDARD TABLE")) {
        continue;
      }

      const token = params[0].getFirstToken();
      const issue = Issue.atToken(file, token, "Prefer RETURNING to EXPORTING", this.getMetadata().key);
      ret.push(issue);
    }

    return ret;
  }

}

