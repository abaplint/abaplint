import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {BasicRuleConfig} from "../_basic_rule_config";
import {Position} from "../../position";
import {Token} from "../../abap/tokens/_token";
import {ParenLeftW, Comment, WParenRightW, WParenRight, StringTemplate} from "../../abap/tokens";

/** Checks that only a single space follows certain common statements. */
export class DoubleSpaceConf extends BasicRuleConfig {
  public keywords: boolean = true;
  public startParen: boolean = true;
  public endParen: boolean = true;
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
    }

    let prev: Token | undefined = undefined;
    for (const t of file.getTokens()) {
      if (prev === undefined) {
        prev = t;
        continue;
      }

      if (this.getConfig().startParen === true
          && prev.getRow() === t.getRow()
          && prev instanceof ParenLeftW
          && !(t instanceof Comment)
          && !(t instanceof StringTemplate)  // tempoary workaround, see #427
          && prev.getEnd().getCol() + 1 < t.getCol()) {
        issues.push(new Issue({file, message: this.getDescription(), key: this.getKey(), start: prev.getStart()}));
      }

      if (this.getConfig().endParen === true
          && prev.getRow() === t.getRow()
          && (t instanceof WParenRightW || t instanceof WParenRight)
          && prev.getEnd().getCol() + 1 < t.getCol()) {
        issues.push(new Issue({file, message: this.getDescription(), key: this.getKey(), start: prev.getEnd()}));
      }

      prev = t;
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