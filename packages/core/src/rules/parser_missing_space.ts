import * as Expressions from "../abap/2_statements/expressions";
import * as Tokens from "../abap/1_lexer/tokens";
import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ExpressionNode, StatementNode, TokenNode} from "../abap/nodes";
import {BasicRuleConfig} from "./_basic_rule_config";
import {RuleTag, IRuleMetadata} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";

export class ParserMissingSpaceConf extends BasicRuleConfig {
}

/** state carried through the walk of one statement */
interface IWalkState {
  prev: AbstractToken | undefined;
  /** outermost Cond or ComponentCond the previous token is part of */
  prevCond: ExpressionNode | undefined;
  prevInDynamic: boolean;
  /** leftmost missing space found so far */
  first: Position | undefined;
}

/*
 * The lexer records whitespace around parentheses in the token type, eg. "WParenLeft" is a "(" with whitespace
 * before but not after. In the expressions below the grammar also accepts the variants without inner whitespace,
 * this rule reports them. Elsewhere the grammar is strict, and missing whitespace gives a parser error instead.
 * Matched on the constructor, none of these expressions is subclassed.
 */
const PAREN_EXPRESSIONS = new Set<unknown>([
  Expressions.MethodCallParam, Expressions.CondSub, Expressions.ComponentCondSub, Expressions.SQLCond,
  Expressions.ValueBodyLine, Expressions.NewObject, Expressions.Source]);

export class ParserMissingSpace extends ABAPRule {
  private conf = new ParserMissingSpaceConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "parser_missing_space",
      title: "Parser Error, missing space",
      shortDescription: `In special cases the ABAP language allows for not having spaces before or after string literals.
This rule makes sure the spaces are consistently required across the language.`,
      tags: [RuleTag.Syntax, RuleTag.Whitespace, RuleTag.SingleFile],
      badExample: `IF ( foo = 'bar').`,
      goodExample: `IF ( foo = 'bar' ).`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ParserMissingSpaceConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];
    const message = "Missing space between string or character literal and parentheses";

    for (const statement of file.getStatements()) {
      const missing = this.missingSpace(statement);
      if (missing) {
        issues.push(Issue.atPosition(file, missing, message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

  /** returns the position of the first missing space in the statement, the rule reports one issue per statement */
  private missingSpace(statement: StatementNode): Position | undefined {
    const state: IWalkState = {prev: undefined, prevCond: undefined, prevInDynamic: false, first: undefined};
    for (const child of statement.getChildren()) {
      this.walk(child, undefined, false, state);
    }
    return state.first;
  }

  private report(state: IWalkState, pos: Position): void {
    if (state.first === undefined || pos.isBefore(state.first)) {
      state.first = pos;
    }
  }

  /** visits each node once in source order, checking the parentheses of expressions and each pair of tokens */
  private walk(node: ExpressionNode | TokenNode, cond: ExpressionNode | undefined, inDynamic: boolean,
               state: IWalkState): void {
    if (node instanceof TokenNode) {
      this.checkToken(node.get(), cond, inDynamic, state);
      return;
    }

    const type = node.get();
    if (cond === undefined && (type instanceof Expressions.Cond || type instanceof Expressions.ComponentCond)) {
      cond = node;
    }
    inDynamic = inDynamic || type instanceof Expressions.Dynamic;

    if (PAREN_EXPRESSIONS.has(type.constructor)) {
      this.checkParens(node, state);
    }

    for (const child of node.getChildren()) {
      this.walk(child, cond, inDynamic, state);
    }
  }

  /** "foo( 'bar')" and "IF (foo = bar )", parentheses directly part of the expression need inner whitespace */
  private checkParens(node: ExpressionNode, state: IWalkState): void {
    const children = node.getChildren();
    let dynamicAccess = false;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!(child instanceof TokenNode)) {
        continue;
      }
      const token = child.get();

      if (token instanceof Tokens.ParenLeft || token instanceof Tokens.WParenLeft) {
        // dynamic component and attribute access, "foo-(name)" and "foo->(name)"
        const prev = children[i - 1]?.get();
        if (prev instanceof Tokens.Dash || prev instanceof Tokens.InstanceArrow) {
          dynamicAccess = true;
        } else {
          this.report(state, token.getEnd());
        }
      } else if (token instanceof Tokens.ParenRight || token instanceof Tokens.ParenRightW) {
        if (dynamicAccess) {
          dynamicAccess = false;
        } else {
          this.report(state, token.getStart());
        }
      } else if (token instanceof Tokens.WParenRight || token instanceof Tokens.WParenRightW) {
        dynamicAccess = false;
      }
    }
  }

  private checkToken(current: AbstractToken, cond: ExpressionNode | undefined, inDynamic: boolean,
                     state: IWalkState): void {
    const prev = state.prev;
    if (prev !== undefined) {
      // "foo( )= bar"
      if ((prev instanceof Tokens.ParenRight || prev instanceof Tokens.WParenRight) && current.getStr() === "=") {
        this.report(state, current.getStart());
      }

      // "IF foo ='bar'", dynamic parts like "('NAME')" are allowed without spaces
      if (current.getStr().startsWith("'")
          && cond !== undefined
          && cond === state.prevCond
          && state.prevInDynamic === false
          && inDynamic === false
          && this.isAdjacent(prev, current)) {
        this.report(state, prev.getEnd());
      }
    }

    state.prev = current;
    state.prevCond = cond;
    state.prevInDynamic = inDynamic;
  }

  private isAdjacent(first: AbstractToken, second: AbstractToken): boolean {
    return first.getRow() === second.getRow()
      && first.getEnd().getCol() === second.getStart().getCol();
  }

}
