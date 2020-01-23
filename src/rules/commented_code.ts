import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile, MemoryFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Registry} from "../registry";
import {Unknown, Empty, Comment} from "../abap/statements/_statement";

/** Detects usage of commented out code.
 * https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#delete-code-instead-of-commenting-it
 * https://docs.abapopenchecks.org/checks/14/
 */
export class CommentedCodeConf extends BasicRuleConfig {
}

export class CommentedCode extends ABAPRule {
  private conf = new CommentedCodeConf();

  public getKey(): string {
    return "commented_code";
  }

  private getDescription(): string {
    return "Commented code";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CommentedCodeConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    let issues: Issue[] = [];

    const rows = file.getRawRows();

    let code = "";
    for (let i = 0; i < rows.length; i++) {
      if (this.isCommentLine(rows[i])) {
        code = code + rows[i].trim().substr(1) + "\n";
      } else if (code !== "") {
        issues = issues.concat(this.check(code, file, i - 1));
        code = "";
      }
    }
    issues = issues.concat(this.check(code, file, rows.length - 1));

    return issues;
  }

  private check(code: string, file: ABAPFile, row: number): Issue[] {
    if (code === "") {
      return [];
    }

    const reg = new Registry().addFile(new MemoryFile("_foobar.prog.abap", code)).parse();

    const statementNodes = reg.getABAPFiles()[0].getStatements();
    if (statementNodes.length === 0) {
      return [];
    }
    let containsStatement: boolean = false;
    for (const statementNode of statementNodes) {
      const statement = statementNode.get();
      if (!(statement instanceof Unknown
          || statement instanceof Empty
          || statement instanceof Comment)) {
        containsStatement = true;
        break;
      }
    }
    if (!containsStatement) {
      return [];
    }

    const position = new Position(row + 1, 1);
    const issue = Issue.atPosition(file, position, this.getDescription(), this.getKey());
    return [issue];
  }

  private isCommentLine(text: string): boolean {
    return ((text.substr(0, 1) === "*") || (text.trim().substr(0, 1) === "\"" && text.trim().substr(1, 1) !== "!"));
  }
}