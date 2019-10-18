import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {BasicRuleConfig} from "../_basic_rule_config";
import {Token} from "../../abap/tokens/_token";
import {ParenLeftW, Comment, WParenRightW, WParenRight, StringTemplate} from "../../abap/tokens";
import {TokenNode, StatementNode, TokenNodeRegex} from "../../abap/nodes";
import {Unknown, MacroContent, MacroCall} from "../../abap/statements/_statement";
import {MethodDef} from "../../abap/statements";

/** Checks that only a single space follows certain common statements. */
export class DoubleSpaceConf extends BasicRuleConfig {
  /** Check for double space after keywords */
  public keywords: boolean = true;
  /** Check for double space after start parenthesis */
  public startParen: boolean = true;
  /** Check for double space before end parenthesis */
  public endParen: boolean = true;
}

export class DoubleSpace extends ABAPRule {

  private conf = new DoubleSpaceConf();

  public getKey(): string {
    return "double_space";
  }

  private getDescription(): string {
    return "Remove double space.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: DoubleSpaceConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const s of file.getStatements()) {

      if (this.conf.keywords === true
          && !(s.get() instanceof Unknown)
          && !(s.get() instanceof MethodDef)
          && !(s.get() instanceof MacroCall)
          && !(s.get() instanceof MacroContent)) {
        const f = this.checkKeywords(s);
        if (f !== undefined) {
          const issue = Issue.atToken(file, f, this.getDescription(), this.getKey());
          issues.push(issue);
        }
      }

      let prev: Token | undefined = undefined;
      for (const t of s.getTokens()) {
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
          const issue = Issue.atToken(file, prev, this.getDescription(), this.getKey());
          issues.push(issue);
        }

        if (this.getConfig().endParen === true
            && prev.getRow() === t.getRow()
            && (t instanceof WParenRightW || t instanceof WParenRight)
            && prev.getEnd().getCol() + 1 < t.getCol()) {
          const issue = Issue.atToken(file, prev, this.getDescription(), this.getKey());
          issues.push(issue);
        }

        prev = t;
      }
    }

    return issues;
  }

  private checkKeywords(s: StatementNode): Token | undefined {
    let prev: TokenNode | undefined = undefined;

    if (s.getColon() !== undefined || s.getPragmas().length > 0) {
// for chained statments just give up
      return undefined;
    }

    for (const n of s.getTokenNodes()) {
      if (prev === undefined) {
        prev = n;
        continue;
      }

      if (prev instanceof TokenNodeRegex
          || prev.get().getStr() === "("
          || prev.get().getStr().toUpperCase() === "CHANGING"
          || prev.get().getStr().toUpperCase() === "EXPORTING"
          || n.get() instanceof StringTemplate) { // tempoary workaround, see #427
        // not a keyword, continue
        prev = n;
        continue;
      }

      if (prev.get().getStart().getRow() === n.get().getStart().getRow()
          && prev.get().getEnd().getCol() + 1 < n.get().getStart().getCol()) {
        return prev.get();
      }

      prev = n;
    }

    return undefined;
  }

}