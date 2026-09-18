import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {EditHelper, IEdit} from "../edit_helper";
import {StatementNode} from "../abap/nodes/statement_node";

export class PreferInsertIntoTableConf extends BasicRuleConfig {}

export class PreferInsertIntoTable extends ABAPRule {
  private conf = new PreferInsertIntoTableConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "prefer_insert_into_table",
      title: "Prefer INSERT INTO TABLE over APPEND",
      shortDescription: `Prefer INSERT INTO TABLE over APPEND`,
      // eslint-disable-next-line max-len
      extendedInformation: `INSERT INTO TABLE respects the table type, while APPEND always tries to add to the end. This will dump if the sort order of a sorted table would change.\n\nhttps://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#prefer-insert-into-table-to-append-to`,
      tags: [RuleTag.SingleFile, RuleTag.Styleguide, RuleTag.Quickfix],
      badExample: `APPEND row TO itab.`,
      goodExample: `INSERT row INTO TABLE itab.`,
    };
  }

  public getConfig() { return this.conf; }
  public setConfig(conf: PreferInsertIntoTableConf) { this.conf = conf; }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    for (const stat of file.getStatements()) {
      if (!(stat.get() instanceof Statements.Append)) {
        continue;
      }
      if (stat.concatTokens().toUpperCase().includes(" SORTED BY ")) {
        continue;
      }

      const fix = this.buildFix(file, stat);
      const message = "Prefer INSERT INTO TABLE over APPEND";
      issues.push(Issue.atStatement(file, stat, message, this.getMetadata().key, this.conf.severity, fix));
    }

    return issues;
  }

  private buildFix(file: ABAPFile, stat: StatementNode): IEdit | undefined {
    const tokens = stat.getTokens();

    // Find the APPEND token (first token)
    const appendToken = tokens[0];
    if (appendToken.getStr().toUpperCase() !== "APPEND") {
      return undefined;
    }

    // Find the last "TO" token that precedes the table target.
    // In all fixable forms the table target follows the last standalone "TO":
    //   APPEND row TO itab
    //   APPEND LINES OF itab2 TO itab
    //   APPEND LINES OF itab2 FROM 1 TO 3 TO itab   <- last TO is the table
    //   APPEND INITIAL LINE TO itab
    let lastToIndex = -1;
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (tokens[i].getStr().toUpperCase() === "TO") {
        lastToIndex = i;
        break;
      }
    }
    if (lastToIndex < 0) {
      return undefined;
    }

    const toToken = tokens[lastToIndex];

    const fix1 = EditHelper.replaceToken(file, appendToken, "INSERT");
    const fix2 = EditHelper.replaceToken(file, toToken, "INTO TABLE");
    return EditHelper.merge(fix1, fix2);
  }
}
