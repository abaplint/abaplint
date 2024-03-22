import {Issue} from "../issue";
import {Position} from "../position";
import {BasicRuleConfig} from "./_basic_rule_config";
import {EditHelper} from "../edit_helper";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IRegistry} from "../_iregistry";
import {IObject} from "../objects/_iobject";
import {MIMEObject, WebMIME} from "../objects";

export class WhitespaceEndConf extends BasicRuleConfig {
}

export class WhitespaceEnd implements IRule {

  private conf = new WhitespaceEndConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "whitespace_end",
      title: "Whitespace at end of line",
      shortDescription: `Checks for redundant whitespace at the end of each line.`,
      extendedInformation: `SMIM and W3MI files are not checked.`,
      tags: [RuleTag.Whitespace, RuleTag.Quickfix, RuleTag.SingleFile],
      badExample: `WRITE 'hello'.      `,
      goodExample: `WRITE 'hello'.`,
    };
  }

  private getMessage(): string {
    return "Remove whitespace at end of line";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: WhitespaceEndConf) {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry): IRule {
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    const issues: Issue[] = [];

    for (const file of obj.getFiles()) {
      if (obj instanceof MIMEObject || obj instanceof WebMIME) {
        continue;
      }

      const rows = file.getRawRows();

      for (let i = 0; i < rows.length; i++) {
        if (rows[i].endsWith(" ") || rows[i].endsWith(" \r")) {
          const match = / +\r?$/.exec(rows[i]);
          const start = new Position(i + 1, match!.index + 1);
          const end = new Position(i + 1, rows[i].length + 1);
          const fix = EditHelper.deleteRange(file, start, end);
          const issue = Issue.atRange(file, start, end, this.getMessage(), this.getMetadata().key, this.conf.severity, fix);
          issues.push(issue);
        }
      }
    }

    return issues;
  }
}