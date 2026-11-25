import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {LanguageVersion, Release, releaseAtLeast} from "../version";
import {RuleTag, IRuleMetadata} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import {EditHelper} from "../edit_helper";
import {ExpressionNode} from "../abap/nodes";

export class StrictSQLConf extends BasicRuleConfig {
}

export class StrictSQL extends ABAPRule {
  private conf = new StrictSQLConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "strict_sql",
      title: "Strict SQL",
      shortDescription: `Strict SQL`,
      extendedInformation: `https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapinto_clause.html

https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENABAP_SQL_STRICT_MODES.html

Also see separate rule sql_escape_host_variables

When INTO/APPENDING is written last, the ABAP options BYPASSING BUFFER and CONNECTION must follow it

Activates from v750 and up`,
      tags: [RuleTag.Upport, RuleTag.Quickfix],
      badExample: `SELECT * FROM ztabl INTO TABLE @rt_content WHERE type = @iv_type ORDER BY PRIMARY KEY.`,
      goodExample: `SELECT * FROM ztabl WHERE type = @iv_type ORDER BY PRIMARY KEY INTO TABLE @rt_content.`,
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

    if (!releaseAtLeast(this.reg.getConfig().getRelease(), Release.v750)
        && this.reg.getConfig().getLanguageVersion() !== LanguageVersion.Cloud) {
      return [];
    }

    for (const s of file.getStatements()) {
      if (s.get() instanceof Statements.Select
          || s.get() instanceof Statements.SelectLoop) {

        const expr = s.findDirectExpression(Expressions.Select);
        const where = expr?.findDirectExpression(Expressions.SQLCond);
        const order = expr?.findDirectExpression(Expressions.SQLOrderBy);
        const into = expr?.findDirectExpression(Expressions.SQLIntoStructure)
          || expr?.findDirectExpression(Expressions.SQLIntoList)
          || expr?.findDirectExpression(Expressions.SQLIntoTable);
        if (expr === undefined || into === undefined) {
          continue;
        } else if (where === undefined || where.getFirstToken().getStart().isBefore(into.getFirstToken().getStart())) {
          issues.push(...this.checkOptionsBeforeInto(file, expr, into));
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
      }
    }

    return issues;
  }

  /** with INTO/APPENDING written last, BYPASSING BUFFER and CONNECTION go behind it */
  private checkOptionsBeforeInto(file: ABAPFile, expr: ExpressionNode, into: ExpressionNode): Issue[] {
    const issues: Issue[] = [];
    const intoStart = into.getFirstToken().getStart();
    // only a clause between the option and INTO makes the INTO a trailing one,
    // "SELECT * FROM t BYPASSING BUFFER INTO TABLE @t" is the classic position of INTO
    const clauses = expr.getChildren().filter(c => c instanceof ExpressionNode && (
      c.get() instanceof Expressions.SQLCond
      || c.get() instanceof Expressions.SQLOrderBy
      || c.get() instanceof Expressions.SQLGroupBy
      || c.get() instanceof Expressions.SQLHaving
      || c.get() instanceof Expressions.SQLFields
      || c.get() instanceof Expressions.SQLForAllEntries));
    const options = [...expr.findDirectExpressions(Expressions.SQLBypassingBuffer),
      ...expr.findDirectExpressions(Expressions.DatabaseConnection)];

    for (const option of options) {
      const optionEnd = option.getLastToken().getEnd();
      if (!option.getFirstToken().getStart().isBefore(intoStart)) {
        continue;
      }
      const between = clauses.some(c => !c.getFirstToken().getStart().isBefore(optionEnd)
        && c.getFirstToken().getStart().isBefore(intoStart));
      if (between === false) {
        continue;
      }
      const fix1 = EditHelper.deleteRange(file, option.getFirstToken().getStart(), optionEnd);
      const fix2 = EditHelper.insertAt(file, into.getLastToken().getEnd(), " " + option.concatTokens());
      const fix = EditHelper.merge(fix2, fix1);
      const message = option.concatTokens().toUpperCase().startsWith("CONNECTION")
        ? "CONNECTION must follow INTO/APPENDING in strict SQL"
        : "BYPASSING BUFFER must follow INTO/APPENDING in strict SQL";
      issues.push(Issue.atToken(file, option.getFirstToken(), message, this.getMetadata().key, this.conf.severity, fix));
    }
    return issues;
  }
}