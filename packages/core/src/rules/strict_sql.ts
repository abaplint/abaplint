import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Version} from "../version";
import {RuleTag, IRuleMetadata} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import {EditHelper} from "../edit_helper";

export class StrictSQLConf extends BasicRuleConfig {
}

export class StrictSQL extends ABAPRule {
  private conf = new StrictSQLConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "strict_sql",
      title: "Strict SQL",
      shortDescription: `Strict SQL`,
      extendedInformation: `https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-US/abapinto_clause.htm

https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-us/abenopensql_strict_mode_750.htm

Also see separate rule sql_escape_host_variables

Activates from v750 and up`,
      tags: [RuleTag.Upport, RuleTag.Syntax, RuleTag.Quickfix],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: StrictSQLConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    const issues: Issue[] = [];

    const type = obj.getType();
    if (type === "INTF" || type === "TYPE") {
      return [];
    }

    if (this.reg.getConfig().getVersion() < Version.v750
        && this.reg.getConfig().getVersion() !== Version.Cloud) {
      return [];
    }

    for (const s of file.getStatements()) {
      if (s.get() instanceof Statements.Select
          || s.get() instanceof Statements.SelectLoop) {

        const expr = s.findDirectExpression(Expressions.Select);
        const where = expr?.findDirectExpression(Expressions.SQLCond);
        const order = expr?.findDirectExpression(Expressions.SQLOrderBy);
        const into = expr?.findDirectExpression(Expressions.SQLIntoStructure)
          || expr?.findDirectExpression(Expressions.SQLIntoTable);
        if (into === undefined || where === undefined) {
          continue;
        } else if (where.getFirstToken().getStart().isBefore(into.getFirstToken().getStart())) {
          continue;
        }

        const fix1 = EditHelper.deleteRange(file, into.getFirstToken().getStart(), into.getLastToken().getEnd());
        let last = where.getLastToken();
        if (order && order.getLastToken().getEnd().isAfter(last.getEnd())) {
          last = order.getLastToken();
        }
        const fix2 = EditHelper.insertAt(file, last.getEnd(), " " + into.concatTokens());
        const fix = EditHelper.merge(fix2, fix1);
        const message = "INTO/APPENDING must be last in strict SQL";
        const issue = Issue.atToken(file, s.getFirstToken(), message, this.getMetadata().key, this.conf.severity, fix);
        issues.push(issue);
        break;
      }
    }

    return issues;
  }
}