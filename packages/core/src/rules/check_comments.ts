import {Issue} from "../issue";
import {Comment} from "../abap/2_statements/statements/_statement";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {IRuleMetadata, RuleTag} from "./_irule";

export class CheckCommentsConf extends BasicRuleConfig {
  /** Allows the use of end-of-line comments. */
  public allowEndOfLine: boolean = false;
}

enum IssueType {
  EndOfLine,
}
export class CheckComments extends ABAPRule {
  private conf = new CheckCommentsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "check_comments",
      title: "Check Comments",
      shortDescription: `Various checks for comment usage.`,
      extendedInformation:
        `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#put-comments-before-the-statement-they-relate-to`,
      tags: [RuleTag.Styleguide],
    };
  }

  private getDescription(issueType: IssueType): string {
    switch (issueType) {
      case IssueType.EndOfLine: return `Do not use end of line comments - move comment to previous row instead`;
      default: return "";
    }
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckCommentsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const rows = file.getRawRows();
    if (this.conf.allowEndOfLine === true) {
      return [];
    }
    const commentRows: number[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.trim().startsWith("*") || row.trim().startsWith(`"`)) {
        commentRows.push(i);
      }
    }
    const statements = file.getStatements();
    for (let i = statements.length - 1; i >= 0; i--) {
      const statement = statements[i];
      if (statement.get() instanceof Comment && !commentRows.includes(statement.getStart().getRow() - 1)) {
        if (statement.getFirstToken().getStr().startsWith(`"#EC`)
            || statement.getFirstToken().getStr().startsWith(`"##`)) {
          continue;
        }
        issues.push(
          Issue.atStatement(
            file,
            statement,
            this.getDescription(IssueType.EndOfLine),
            this.getMetadata().key,
            this.conf.severity));
      }
    }
    return issues;
  }
}