import {Issue} from "../issue";
import {Position} from "../position";
import {BasicRuleConfig} from "./_basic_rule_config";
import {EditHelper} from "../edit_helper";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IRegistry} from "../_iregistry";
import {IObject} from "../objects/_iobject";
import {IFile} from "../files/_ifile";
import {MIMEObject, WebMIME} from "../objects";

export class FinalNewlineConf extends BasicRuleConfig {
}

export class FinalNewline implements IRule {

  private conf = new FinalNewlineConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "final_newline",
      title: "Final newline",
      shortDescription: `Checks that ABAP and XML files end with exactly one newline`,
      extendedInformation: `abapGit serializes every file with exactly one newline at the end. A file without it,
or with empty lines at the end, is changed again on the next pull and shows up in every diff.

Empty files and files containing only line breaks are not checked. A carriage return before the
newline is ignored, see rule line_break_style. SMIM and W3MI files and XSLT sources are not checked.`,
      tags: [RuleTag.Whitespace, RuleTag.Quickfix, RuleTag.SingleFile],
      badExample: `WRITE 'hello'.`,
      goodExample: `WRITE 'hello'.\n`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: FinalNewlineConf) {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry): IRule {
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    const issues: Issue[] = [];

    if (obj instanceof MIMEObject || obj instanceof WebMIME) {
      return issues;
    }

    for (const file of obj.getFiles()) {
      const filename = file.getFilename();
      if ((filename.endsWith(".abap") || filename.endsWith(".xml")) && !filename.endsWith(".xslt.source.xml")) {
        const issue = this.checkFile(file);
        if (issue) {
          issues.push(issue);
        }
      }
    }

    return issues;
  }

  private checkFile(file: IFile): Issue | undefined {
    const rows = file.getRawRows();
    const last = rows[rows.length - 1];

    if (last !== "") {
      const end = new Position(rows.length, last.length + 1);
      const fix = EditHelper.insertAt(file, end, "\n");
      return Issue.atPosition(file, end, "Add newline at end of file", this.getMetadata().key, this.conf.severity, fix);
    }

    let row = rows.length - 2;
    while (row >= 0 && (rows[row] === "" || rows[row] === "\r")) {
      row--;
    }
    if (row < 0 || row === rows.length - 2) {
      return undefined;
    }

    const start = new Position(row + 2, 1);
    const fix = EditHelper.deleteRange(file, start, new Position(rows.length, 1));
    return Issue.atPosition(file, start, "Remove empty lines at end of file", this.getMetadata().key, this.conf.severity, fix);
  }
}
