import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Punctuation, Comment as CommentToken} from "../abap/1_lexer/tokens";
import {Unknown} from "../abap/2_statements/statements/_statement";

export class EmptyLineinStatementConf extends BasicRuleConfig {
  /** Allow changed empty lines in chanined statements */
  public allowChained: boolean = false;
}

export class EmptyLineinStatement extends ABAPRule {

  private conf = new EmptyLineinStatementConf();

  public getMetadata() {
    return {
      key: "empty_line_in_statement",
      title: "Find empty lines in statements",
      shortDescription: `Checks that statements do not contain empty lines.`,
      extendedInformation: `https://docs.abapopenchecks.org/checks/41/`,
    };
  }

  private getMessage(): string {
    return "Remove empty line in statement";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: EmptyLineinStatementConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    for (const s of file.getStatements()) {
      if (s.get() instanceof Unknown) {
        return []; // skip the file if there are parser errors
      }
    }

    let prevLine: number | undefined = undefined;
    for (const t of file.getTokens()) {
      if (prevLine === undefined && t instanceof CommentToken) {
        continue;
      } else if (prevLine === undefined) {
        prevLine = t.getRow();
      }
      if (prevLine && t.getRow() - prevLine >= 2) {
        const issue = Issue.atToken(file, t, this.getMessage(), this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
      if (t instanceof Punctuation && t.getStr() === ".") {
        prevLine = undefined;
      } else if (this.conf.allowChained === true && t instanceof Punctuation && t.getStr() === ",") {
        prevLine = undefined;
      } else {
        prevLine = t.getRow();
      }
    }

    return issues;
  }

}