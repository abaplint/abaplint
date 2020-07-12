import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile, MemoryFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Unknown, Empty, Comment} from "../abap/2_statements/statements/_statement";
import {ABAPObject} from "../objects/_abap_object";
import {FunctionGroup} from "../objects";
import {Include} from "../abap/2_statements/statements";
import {ABAPParser} from "../abap/abap_parser";
import {RuleTag} from "./_irule";

export class CommentedCodeConf extends BasicRuleConfig {
  /** Allow INCLUDEs in function groups */
  public allowIncludeInFugr: boolean = true;
}

export class CommentedCode extends ABAPRule {
  private conf = new CommentedCodeConf();

  public getMetadata() {
    return {
      key: "commented_code",
      title: "Find commented code",
      shortDescription: `Detects usage of commented out code.`,
      extendedInformation:
`https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#delete-code-instead-of-commenting-it
https://docs.abapopenchecks.org/checks/14/`,
      tags: [RuleTag.Styleguide],
    };
  }

  private getMessage(): string {
    return "Commented code";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CommentedCodeConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    let issues: Issue[] = [];

    const rows = file.getRawRows();

    let code = "";
    for (let i = 0; i < rows.length; i++) {
      if (this.isCommentLine(rows[i])) {
        code = code + rows[i].trim().substr(1) + "\n";
      } else if (code !== "") {
        issues = issues.concat(this.check(code.trim(), file, i - 1, obj));
        code = "";
      }
    }
    issues = issues.concat(this.check(code.trim(), file, rows.length - 1, obj));

    return issues;
  }

  private check(code: string, file: ABAPFile, row: number, obj: ABAPObject): Issue[] {
    // assumption: code must end with "." in order to be valid ABAP
    if (code === "" || code.charAt(code.length - 1) !== ".") {
      return [];
    }

    const commented = new MemoryFile("_foobar.prog.abap", code);
    const abapFile = new ABAPParser().parse([commented]).output[0];
    const statementNodes = abapFile.getStatements();
    if (statementNodes.length === 0) {
      return [];
    }

    let containsStatement: boolean = false;
    for (const statementNode of statementNodes) {
      const statement = statementNode.get();
      if (this.getConfig().allowIncludeInFugr === true
          && obj instanceof FunctionGroup
          && statement instanceof Include) {
        continue;
      }
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
    const issue = Issue.atPosition(file, position, this.getMessage(), this.getMetadata().key);
    return [issue];
  }

  private isCommentLine(text: string): boolean {
    return (text.substr(0, 1) === "*")
      || (text.trim().substr(0, 1) === "\"" && text.trim().substr(1, 1) !== "!");
  }
}