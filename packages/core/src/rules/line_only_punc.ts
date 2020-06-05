import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";
import {RuleTag} from "./_irule";

export class LineOnlyPuncConf extends BasicRuleConfig {
  /** Ignore lines with only puncutation in global exception classes */
  public ignoreExceptions: boolean = true;
}

export class LineOnlyPunc extends ABAPRule {

  private conf = new LineOnlyPuncConf();

  public getMetadata() {
    return {
      key: "line_only_punc",
      title: "Line containing only punctuation",
      shortDescription: `Detects lines containing only punctuation.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#close-brackets-at-line-end
https://docs.abapopenchecks.org/checks/16/`,
      tags: [RuleTag.Styleguide],
    };
  }

  private getMessage(): string {
    return "A line cannot contain only \".\" or \").\"";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: LineOnlyPuncConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: IRegistry, obj: IObject) {
    const issues: Issue[] = [];

    if (obj instanceof Class) {
      const definition = obj.getClassDefinition2();
      if (definition === undefined) {
        return [];
      } else if (this.conf.ignoreExceptions && definition.isException) {
        return [];
      }
    }

    const rows = file.getRawRows();
    const reg = new RegExp("^\\)?\\. *(\\\".*)?$");

    for (let i = 0; i < rows.length; i++) {
      if (reg.exec(rows[i].trim())) {
        const column = rows[i].indexOf(")") >= 0 ? rows[i].indexOf(")") + 1 : rows[i].indexOf(".") + 1;
        const position = new Position(i + 1, column);
        const issue = Issue.atPosition(file, position, this.getMessage(), this.getMetadata().key);
        issues.push(issue);
      }
    }

    return issues;
  }

}