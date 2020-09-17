import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IRegistry} from "../_iregistry";

export class LineBreakStyleConf extends BasicRuleConfig {
}

export class LineBreakStyle implements IRule {
  private conf = new LineBreakStyleConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "line_break_style",
      title: "Makes sure line breaks are consistent in the ABAP code",
      shortDescription: `Enforces LF as newlines in ABAP files

abapGit does not work with CRLF`,
      tags: [RuleTag.Whitespace],
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

    for (const file of obj.getFiles()) {
      if (file.getFilename().endsWith(".abap")) {
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