import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {BasicRuleConfig} from "../_basic_rule_config";
import {Position} from "../../position";

export class DoubleSpaceConf extends BasicRuleConfig {
  public keywords = true;
  public startParen = true;
  public endParen = true;
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
    let issues: Issue[] = [];

    const rows = file.getRawRows();

    for (let i = 0; i < rows.length; i++) {
      if (this.getConfig().keywords === true) {
        const reg = /^\s*(IF|IF NOT|SHIFT|WHEN|READ TABLE|MODIFY|DELETE|COLLECT|CHECK|SORT|ELSEIF|DATA|MOVE-CORRESPONDING|APPEND|METHOD)  /;
        issues = issues.concat(this.checkAndReport(reg, rows[i], i, file));
      }
      if (this.getConfig().startParen === true) {
        const reg = /\([ ]{2}[ ]*\S/;
        issues = issues.concat(this.checkAndReport(reg, rows[i], i, file));
      }
      if (this.getConfig().endParen === true) {
        const reg = /\S[ ]*[ ]{2}\)/;
        issues = issues.concat(this.checkAndReport(reg, rows[i], i, file));
      }
    }

    return issues;
  }

  private checkAndReport(reg: RegExp, code: string, row: number, file: ABAPFile): Issue[] {
    if (code.match(reg)) {
      const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: new Position(row + 1, 1)});
      return [issue];
    }
    return [];
  }
}