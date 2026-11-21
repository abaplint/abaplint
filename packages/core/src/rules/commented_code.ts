import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Unknown, Empty, Comment} from "../abap/2_statements/statements/_statement";
import {ABAPObject} from "../objects/_abap_object";
import {FunctionGroup} from "../objects";
import {Include} from "../abap/2_statements/statements";
import {ABAPParser} from "../abap/abap_parser";
import {RuleTag, IRuleMetadata} from "./_irule";
import {EditHelper} from "../edit_helper";
import {ABAPFile} from "../abap/abap_file";
import {MemoryFile} from "../files/memory_file";
import {StatementNode} from "../abap/nodes";

export class CommentedCodeConf extends BasicRuleConfig {
  /** Allow INCLUDEs in function groups */
  public allowIncludeInFugr: boolean = true;
}

export class CommentedCode extends ABAPRule {
  private conf = new CommentedCodeConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "commented_code",
      title: "Find commented code",
      shortDescription: `Detects usage of commented out code.`,
      extendedInformation:
`https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#delete-code-instead-of-commenting-it
https://docs.abapopenchecks.org/checks/14/`,
      tags: [RuleTag.Styleguide, RuleTag.Quickfix, RuleTag.SingleFile],
      badExample: `* WRITE 'hello world'.`,
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
    let posEnd: Position | undefined = undefined;
    let posStart: Position | undefined = undefined;

    for (let i = 0; i < rows.length; i++) {
      if (this.isCommentLine(rows[i])) {
        if (code === "") {
          posStart = new Position(i + 1, 1);
        }
        code = code + rows[i].trim().substr(1) + "\n";
        posEnd = new Position(i + 1, rows[i].length + 1);
      } else if (code !== "" && posStart && posEnd) {
        issues = issues.concat(this.check(code.trim(), file, posStart, posEnd, obj));
        code = "";
      }
    }

    if (posStart && posEnd) {
      issues = issues.concat(this.check(code.trim(), file, posStart, posEnd, obj));
    }

    return issues;
  }

  private check(code: string, file: ABAPFile, posStart: Position, posEnd: Position, obj: ABAPObject): Issue[] {
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
    for (let i = 0; i < statementNodes.length; i++) {
      const statementNode = statementNodes[i];
      const statement = statementNode.get();
      if (this.getConfig().allowIncludeInFugr === true
          && obj instanceof FunctionGroup
          && statement instanceof Include) {
        continue;
      }
      if (!(statement instanceof Unknown
          || statement instanceof Empty
          || statement instanceof Comment)) {
        if (this.isSplitFromText(statementNodes, i)) {
          continue;
        }
        containsStatement = true;
        break;
      }
    }
    if (!containsStatement) {
      return [];
    }

    const fix = EditHelper.deleteRange(file, posStart, posEnd);
    const issue = Issue.atRange(file, posStart, posEnd, this.getMessage(), this.getMetadata().key, this.conf.severity, fix);
    return [issue];
  }

  /**
   * The statement parser splits an Unknown statement at a line break if the rest parses as a statement.
   * In comment text, such a split is code only if no further text follows the statement on its line.
   */
  private isSplitFromText(statementNodes: readonly StatementNode[], index: number): boolean {
    const previous = statementNodes[index - 1];
    if (previous === undefined
        || !(previous.get() instanceof Unknown)
        || [".", ","].includes(previous.getLastToken().getStr())) {
      return false;
    }
    const next = statementNodes[index + 1];
    return next !== undefined
      && next.get() instanceof Unknown
      && next.getFirstToken().getRow() === statementNodes[index].getLastToken().getRow();
  }

  private isCommentLine(text: string): boolean {
    return (text.substr(0, 1) === "*")
      || (text.trim().substr(0, 1) === "\"" && text.trim().substr(1, 1) !== "!");
  }
}