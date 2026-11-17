import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ExpressionNode, StatementNode, TokenNode} from "../abap/nodes";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";
import {EditHelper, IEdit} from "../edit_helper";
import {Severity} from "../severity";

export class CharacterFieldLiteralBlanksConf extends BasicRuleConfig {
  public severity?: Severity = Severity.Warning;
  /** Report a FIND or REPLACE search pattern that is a character field literal containing only blanks, or space,
   *  the pattern is empty: ALL OCCURRENCES raises an exception, FIRST OCCURRENCE matches before the first character */
  public searchPattern: boolean = true;
  /** Report a character field literal ending with a blank as an operand of &&, of CONCATENATE without
   *  RESPECTING BLANKS, or as an embedded expression in a string template, the trailing blanks are dropped */
  public concatenation: boolean = true;
}

export class CharacterFieldLiteralBlanks extends ABAPRule {
  private conf = new CharacterFieldLiteralBlanksConf();

  // tokens directly before the pattern of FIND and REPLACE, when no FindType is given
  private static readonly beforePattern = new Set(["FIND", "REPLACE", "OF", "OCCURRENCE", "OCCURRENCES", "OCCURENCE", "OCCURENCES"]);

  public getMetadata(): IRuleMetadata {
    return {
      key: "character_field_literal_blanks",
      title: "Ignored blanks in character field literals",
      shortDescription: `Reports character field literals ('...') whose blanks are ignored where the code relies on them`,
      extendedInformation: `A character field literal '...' (called text field literal in the ABAP
documentation) has type c, and trailing blanks of type c operands are ignored in many positions.
A text string literal \`...\` has type string and keeps them.

Option searchPattern: a FIND or REPLACE search pattern (SUBSTRING, character mode) that is a character field
literal containing only blanks, '' or space. The pattern is empty: FIND/REPLACE ALL OCCURRENCES raises
CX_SY_FIND_INFINITE_LOOP/CX_SY_REPLACE_INFINITE_LOOP, the first occurrence is found before the first character.
https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapfind_pattern.htm

Option concatenation: a character field literal ending with a blank as an operand of &&, as an operand of
CONCATENATE without RESPECTING BLANKS, or as the whole embedded expression of a string template without
formatting options. The trailing blanks are dropped, 'Hello ' && name gives "HelloJohn". space is reported
the same way.
https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abenstring_operators.htm

The quick fix replaces the literal with a text string literal with the same content.

Not reported: text string literals, CONCATENATE ... RESPECTING BLANKS, the separator of SEPARATED BY
(its trailing blanks are kept), the literal operator &, literals with a text symbol, PCRE and REGEX
patterns, byte mode, comparisons and parameters.`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: `REPLACE ALL OCCURRENCES OF ' ' IN lv_text WITH ''.
lv_text = 'Hello ' && lv_name.`,
      goodExample: `REPLACE ALL OCCURRENCES OF \` \` IN lv_text WITH ''.
lv_text = \`Hello \` && lv_name.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CharacterFieldLiteralBlanksConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      if (this.conf.searchPattern === true) {
        const issue = this.checkSearchPattern(file, statement);
        if (issue !== undefined) {
          issues.push(issue);
        }
      }
      if (this.conf.concatenation === true) {
        issues.push(...this.checkConcatenation(file, statement));
      }
    }

    return issues;
  }

////////////////

  private checkSearchPattern(file: ABAPFile, statement: StatementNode): Issue | undefined {
    const s = statement.get();
    const isFind = s instanceof Statements.Find;
    if ((isFind === false && !(s instanceof Statements.Replace))
        || statement.findDirectTokenByText("IN") === undefined
        || statement.findDirectTokenByText("BYTE") !== undefined) {
      return undefined;
    }

    const pattern = this.findPattern(statement);
    if (pattern === undefined || pattern.getChildren().length !== 1) {
      return undefined;
    }
    const token = this.blankOperand(pattern);
    if (token === undefined || this.content(token).trim() !== "") {
      return undefined;
    }

    const name = isFind ? "FIND" : "REPLACE";
    const table = statement.findDirectTokenByText("TABLE") !== undefined;
    let effect = "it is found before the first character";
    if (statement.findDirectTokenByText("ALL") !== undefined) {
      effect = isFind && table
        ? "FIND ALL OCCURRENCES IN TABLE with an empty pattern is not possible"
        : `${name} ALL OCCURRENCES raises CX_SY_${name}_INFINITE_LOOP`;
    }
    const message = `Search pattern ${token.getStr()} is empty, blanks of character field literals are ignored, ${effect}`;
    return Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity, this.buildFix(file, token));
  }

  /** the substring pattern of FIND or REPLACE, undefined for PCRE and REGEX and for REPLACE SECTION */
  private findPattern(statement: StatementNode): ExpressionNode | undefined {
    const children = statement.getChildren();
    for (let i = 1; i < children.length; i++) {
      const child = children[i];
      if (child instanceof TokenNode && child.concatTokens().toUpperCase() === "IN") {
        return undefined;
      } else if (!(child instanceof ExpressionNode) || !(child.get() instanceof Expressions.Source)) {
        continue;
      }
      const before = children[i - 1];
      if (before instanceof ExpressionNode && before.get() instanceof Expressions.FindType) {
        return before.concatTokens().toUpperCase() === "SUBSTRING" ? child : undefined;
      } else if (before instanceof TokenNode && CharacterFieldLiteralBlanks.beforePattern.has(before.concatTokens().toUpperCase())) {
        return child;
      }
    }
    return undefined;
  }

  private checkConcatenation(file: ABAPFile, statement: StatementNode): Issue[] {
    const operands: ExpressionNode[] = [];
    const sources = statement.findAllExpressionsRecursive(Expressions.Source);

    // left operands of &&
    for (const source of sources) {
      if (source.findDirectTokenByText("&&") !== undefined) {
        operands.push(source);
      }
    }

    // right operands of && and &&=
    for (const node of [statement, ...sources]) {
      const children = node.getChildren();
      for (let i = 1; i < children.length; i++) {
        const before = children[i - 1].concatTokens();
        const child = children[i];
        if ((before === "&&" || before === "&&=")
            && child instanceof ExpressionNode
            && child.get() instanceof Expressions.Source) {
          operands.push(child);
        }
      }
    }

    // embedded expressions without formatting options
    for (const embedded of statement.findAllExpressionsRecursive(Expressions.StringTemplateSource)) {
      const source = embedded.findDirectExpression(Expressions.Source);
      if (source !== undefined
          && source.getChildren().length === 1
          && embedded.findDirectExpression(Expressions.StringTemplateFormatting) === undefined) {
        operands.push(source);
      }
    }

    // CONCATENATE without RESPECTING BLANKS, the separator keeps its blanks
    if (statement.get() instanceof Statements.Concatenate
        && statement.findDirectTokenByText("RESPECTING") === undefined
        && statement.findDirectTokenByText("BYTE") === undefined) {
      for (const child of statement.getChildren()) {
        if (child instanceof TokenNode && child.concatTokens().toUpperCase() === "INTO") {
          break;
        } else if (child instanceof ExpressionNode && child.get() instanceof Expressions.SimpleSource3) {
          operands.push(child);
        }
      }
    }

    const issues: Issue[] = [];
    const reported = new Set<AbstractToken>();
    for (const operand of operands) {
      const token = this.blankOperand(operand);
      if (token === undefined || reported.has(token)) {
        continue;
      }
      const content = this.content(token);
      if (content === "" || content.endsWith(" ") === false) {
        continue;
      }
      reported.add(token);
      const message = token.getStr().startsWith("'")
        ? `Trailing blanks of ${token.getStr()} are ignored here, use a text string literal`
        : `${token.getStr()} is ignored here, use \` \``;
      issues.push(Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity, this.buildFix(file, token)));
    }
    return issues;
  }

  /** the token of a character field literal or of space at the start of the operand */
  private blankOperand(operand: ExpressionNode): AbstractToken | undefined {
    const first = operand.getChildren()[0];
    if (!(first instanceof ExpressionNode)) {
      return undefined;
    }
    if (first.get() instanceof Expressions.Constant) {
      const str = first.findDirectExpression(Expressions.ConstantString)?.getFirstToken();
      return str?.getStr().startsWith("'") ? str : undefined;
    } else if (first.get() instanceof Expressions.FieldChain && first.concatTokens().toUpperCase() === "SPACE") {
      return first.getFirstToken();
    }
    return undefined;
  }

  /** the value of a character field literal, " " for space */
  private content(token: AbstractToken): string {
    const str = token.getStr();
    if (str.startsWith("'") === false) {
      return " ";
    }
    return str.substring(1, str.length - 1).replace(/''/g, "'");
  }

  private buildFix(file: ABAPFile, token: AbstractToken): IEdit | undefined {
    const content = this.content(token);
    if (content === "") {
      return undefined;
    }
    return EditHelper.replaceToken(file, token, "`" + content.replace(/`/g, "``") + "`");
  }

}
