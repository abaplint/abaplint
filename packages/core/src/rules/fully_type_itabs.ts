import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class FullyTypeITabsConf extends BasicRuleConfig {
}

export class FullyTypeITabs extends ABAPRule {
  private conf = new FullyTypeITabsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "fully_type_itabs",
      title: "Fully type internal tables",
      shortDescription: `No implict table types or table keys`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#use-the-right-table-type
https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#avoid-default-key`,
      badExample: `DATA lt_foo TYPE TABLE OF ty.
DATA lt_bar TYPE STANDARD TABLE OF ty.`,
      goodExample: `DATA lt_foo TYPE STANDARD TABLE OF ty WITH EMPTY KEY.`,
      tags: [RuleTag.SingleFile],
    };
  }

  public getConfig(): FullyTypeITabsConf {
    return this.conf;
  }

  public setConfig(conf: FullyTypeITabsConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      if (!(statement.get() instanceof Statements.Data || statement.get() instanceof Statements.Type)) {
        continue;
      }

      const tt = statement.findFirstExpression(Expressions.TypeTable);
      if (tt === undefined) {
        continue;
      }

      const concat = tt.concatTokens().toUpperCase();

      if (concat.includes("TYPE TABLE OF")) {
        const message = "Specify table type";
        issues.push(
          Issue.atPosition(
            file,
            tt.getFirstToken().getStart(),
            message,
            this.getMetadata().key,
            this.conf.severity));
      } else if (concat.includes(" TABLE FOR ")) {
        continue;
      } else if (concat.includes(" WITH ") === false && concat.includes(" RANGE OF ") === false) {
        const message = "Specify table key";
        issues.push(
          Issue.atPosition(
            file,
            tt.getFirstToken().getStart(),
            message,
            this.getMetadata().key,
            this.conf.severity));
      }
    }
    return issues;
  }

}
