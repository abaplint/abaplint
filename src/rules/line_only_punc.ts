import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Registry} from "../registry";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";

/** Detects lines containing only punctuation.
 * https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#close-brackets-at-line-end
 * https://docs.abapopenchecks.org/checks/16/
 */
export class LineOnlyPuncConf extends BasicRuleConfig {
  public ignoreExceptions: boolean = true;
}

export class LineOnlyPunc extends ABAPRule {

  private conf = new LineOnlyPuncConf();

  public getKey(): string {
    return "line_only_punc";
  }

  private getDescription(): string {
    return "A line cannot contain only \".\" or \").\"";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: LineOnlyPuncConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: Registry, obj: IObject) {
    const issues: Issue[] = [];

    if (obj instanceof Class) {
      const definition = obj.getClassDefinition();
      if (definition === undefined) {
        return [];
      } else if (this.conf.ignoreExceptions && definition.isException()) {
        return [];
      }
    }

    const rows = file.getRawRows();
    const reg = new RegExp("^\\)?\\. *(\\\".*)?$");

    for (let i = 0; i < rows.length; i++) {
      if (reg.exec(rows[i].trim())) {
        const column = rows[i].indexOf(")") >= 0 ? rows[i].indexOf(")") + 1 : rows[i].indexOf(".") + 1;
        const position = new Position(i + 1, column);
        const issue = Issue.atPosition(file, position, this.getDescription(), this.getKey());
        issues.push(issue);
      }
    }

    return issues;
  }

}