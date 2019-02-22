import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Registry} from "../registry";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";

export class LineOnlyPuncConf extends BasicRuleConfig {
  public ignoreExceptions: boolean = true;
}

export class LineOnlyPunc extends ABAPRule {

  private conf = new LineOnlyPuncConf();

  public getKey(): string {
    return "line_only_punc";
  }

  public getDescription(): string {
    return "Line contains only . or ).";
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
    for (let i = 0; i < rows.length; i++) {
      const trim = rows[i].trim();

      if (trim === "." || trim === ").") {
        const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: new Position(i + 1, 0)});
        issues.push(issue);
      }
    }

    return issues;
  }

}