import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {BasicRuleConfig} from "../_basic_rule_config";
import {Token} from "../../abap/1_lexer/tokens/_token";
import {ParenLeftW, Comment, WParenRightW, WParenRight, StringTemplate} from "../../abap/1_lexer/tokens";
import {TokenNode, StatementNode, TokenNodeRegex} from "../../abap/nodes";
import {Unknown, MacroContent, MacroCall} from "../../abap/2_statements/statements/_statement";
import {MethodDef} from "../../abap/2_statements/statements";
import {Position} from "../../position";

/** Checks that only a single space follows certain common statements. */
export class DoubleSpaceConf extends BasicRuleConfig {
  /** Check for double space after keywords */
  public keywords: boolean = true;
  /** Check for double space after start parenthesis */
  public startParen: boolean = true;
  /** Check for double space before end parenthesis */
  public endParen: boolean = true;
  /** Check for double space after colon/chaining operator */
  public afterColon: boolean = true;
}

export class DoubleSpace extends ABAPRule {

  private conf = new DoubleSpaceConf();

  public getMetadata() {
    return {key: "double_space"};
  }

  private getMessage(): string {
    return "Remove double space";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: DoubleSpaceConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    let issues: Issue[] = [];

    for (const s of file.getStatements()) {

      if (this.conf.keywords === true
          && !(s.get() instanceof Unknown)
          && !(s.get() instanceof MethodDef)
          && !(s.get() instanceof MacroCall)
          && !(s.get() instanceof MacroContent)) {
        const f = this.checkKeywords(s);
        if (f !== undefined) {
          const issue = Issue.atToken(file, f, this.getMessage(), this.getMetadata().key);
          issues.push(issue);
        }
      }

      issues = issues.concat(this.checkParen(s, file));

    }

    issues = issues.concat(this.checkAfterColon(file));

    return issues;
  }

  private checkAfterColon(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    let cPosition: Position | undefined = undefined;

    if (this.conf.afterColon !== true) {
      return [];
    }

    for (const s of file.getStatements()) {
      const colon = s.getColon();
      if (colon === undefined) {
        continue;
      } else if (cPosition !== undefined && cPosition.getCol() === colon.getCol()) {
        continue;
      }

      cPosition = colon.getStart();

      for (const t of s.getTokens()) {
        if (t.getRow() !== cPosition.getRow()) {
          return [];
        } else if (t.getCol() < cPosition.getCol()) {
          continue;
        }

        if (t.getCol() > cPosition.getCol() + 2) {
          const issue = Issue.atToken(file, colon, this.getMessage(), this.getMetadata().key);
          issues.push(issue);
        }

        break;
      }
    }

    return issues;
  }

  private checkParen(s: StatementNode, file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

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
        const issue = Issue.atToken(file, prev, this.getMessage(), this.getMetadata().key);
        issues.push(issue);
      }

      if (this.getConfig().endParen === true
          && prev.getRow() === t.getRow()
          && (t instanceof WParenRightW || t instanceof WParenRight)
          && prev.getEnd().getCol() + 1 < t.getCol()) {
        const issue = Issue.atToken(file, prev, this.getMessage(), this.getMetadata().key);
        issues.push(issue);
      }

      prev = t;
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
          || prev.get().getStr().toUpperCase() === "OTHERS"
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