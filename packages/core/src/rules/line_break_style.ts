import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IRegistry} from "../_iregistry";
import {MIMEObject, WebMIME} from "../objects";

export class LineBreakStyleConf extends BasicRuleConfig {
}

export class LineBreakStyle implements IRule {
  private conf = new LineBreakStyleConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "line_break_style",
      title: "Makes sure line breaks are consistent",
      shortDescription: `Enforces LF as newlines in ABAP and XML files

abapGit does not work with CRLF`,
      extendedInformation: `SMIM and W3MI files are not checked.`,
      tags: [RuleTag.Whitespace, RuleTag.SingleFile],
    };
  }

  public initialize(_reg: IRegistry) {
    return this;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: LineBreakStyleConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    const output: Issue[] = [];

    if (obj instanceof MIMEObject || obj instanceof WebMIME) {
      return output;
    }

    for (const file of obj.getFiles()) {
      const filename = file.getFilename();
      if (filename.endsWith(".abap") || filename.endsWith(".xml")) {
        const rows = file.getRawRows();
        for (let i = 0; i < rows.length; i++) {
          if (rows[i].endsWith("\r") === true) {
            const message = "Line contains carriage return";
            const issue = Issue.atRow(file, i + 1, message, this.getMetadata().key, this.conf.severity);
            output.push(issue);
            break; // only one finding per file
          }
        }
      }
    }

    return output;
  }

}