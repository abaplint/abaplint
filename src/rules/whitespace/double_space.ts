import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {BasicRuleConfig} from "../_basic_rule_config";
import {Position} from "../../position";

export class DoubleSpaceConf extends BasicRuleConfig {
}

export class DoubleSpace extends ABAPRule {

  private conf = new DoubleSpaceConf();

  public getKey(): string {
    return "double_space";
  }

  public getDescription(): string {
    return "Double space";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: DoubleSpaceConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const rows = file.getRawRows();

    for (let i = 0; i < rows.length; i++) {
      const reg = /^\s*(IF|SHIFT|WHEN|READ TABLE|MODIFY|DELETE|COLLECT|CHECK|SORT|ELSEIF|DATA|MOVE-CORRESPONDING|APPEND|METHOD)  /;
      if (rows[i].match(reg)) {
        const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: new Position(i + 1, 1)});
        issues.push(issue);
      }
    }

    /*
    for (const s of file.getStatements()) {
      let expectCol: number | undefined = undefined;
      let expectRow: number | undefined = undefined;
      for (const t of s.getTokens()) {
        if (expectRow === t.getRow() && expectCol !== t.getCol()) {
          const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: t.getPos()});
          issues.push(issue);
        }

        expectRow = t.getRow();
        expectCol = t.getCol() + t.getStr().length + 1;
      }
    }
    */

    return issues;
  }
}