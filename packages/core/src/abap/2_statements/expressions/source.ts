import {ver, seq, tok, altPrio, optPrio, regex, Expression, starPrio, star, AlsoIn} from "../combi";
import {WParenLeftW, WParenRightW, WDashW, ParenLeftW, WPlus, WPlusW, Dash, ParenRightW, ParenLeft} from "../../1_lexer/tokens";
import {CondBody, SwitchBody, ComponentChain, FieldChain, ReduceBody, TypeNameOrInfer, Cast,
  MethodCallChain, ArithOperator, Cond, Constant, StringTemplate, ConvBody, CorrespondingBody, ValueBody, FilterBody, Arrow} from ".";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {Result} from "../result";
import {ExpressionNode} from "../../nodes";
import {TextElement} from "./text_element";
import {AttributeChain} from "./attribute_chain";
import {Dereference} from "./dereference";
import {dynAttr, dynComp} from "./_dynamic_access";

// todo, COND and SWITCH are quite similar?

// this class is used quite often, so its nice to have the differentiating tokens part of it

export class Source extends Expression {
  public getRunnable(): IStatementRunnable {
    const comp = seq(tok(Dash), ComponentChain);
    const attr = seq(Arrow, AttributeChain);
    const deref = optPrio(ver(Release.v756, Dereference));

// below v756 "->*" directly after a functional method call is a syntax error, CAST can be dereferenced
    const dynChain = star(seq(altPrio(dynAttr(), dynComp()), optPrio(Dereference)));
    const castDeref = seq(Cast, Dereference);

    const method = seq(MethodCallChain, optPrio(altPrio(attr, comp)), deref, dynChain);

    const rparen = tok(WParenRightW);
    const rparenNoSpace = altPrio(tok(ParenRightW), tok(WParenRightW));
    const lparenNoSpace = altPrio(tok(ParenLeft), tok(ParenLeftW));

// paren used for eg. "( 2 + 1 ) * 4"
    const paren = seq(tok(WParenLeftW),
                      Source,
                      rparen);

    const bool = seq(altPrio(ver(Release.v702, regex(/^BOOLC$/i), {also: AlsoIn.OpenABAP}),
                             ver(Release.v740sp08, regex(/^XSDBOOL$/i), {also: AlsoIn.OpenABAP})),
                     tok(ParenLeftW),
                     Cond,
                     ")");

    const prefix = altPrio(tok(WPlus), "BIT-NOT");

    const old = seq(optPrio(prefix), altPrio(Constant,
                                             StringTemplate,
                                             TextElement,
                                             bool,
                                             castDeref,
                                             method,
                                             seq(FieldChain, deref),
                                             paren));

    const corr = ver(Release.v740sp05, seq("CORRESPONDING",
                                           TypeNameOrInfer,
                                           tok(ParenLeftW),
                                           CorrespondingBody,
                                           rparen), {also: AlsoIn.OpenABAP});

    const conv = ver(Release.v740sp02, seq("CONV",
                                           TypeNameOrInfer,
                                           lparenNoSpace,
                                           ConvBody,
                                           rparenNoSpace), {also: AlsoIn.OpenABAP});

    const swit = ver(Release.v740sp02, seq("SWITCH",
                                           TypeNameOrInfer,
                                           tok(ParenLeftW),
                                           SwitchBody,
                                           rparenNoSpace), {also: AlsoIn.OpenABAP});

    const value = ver(Release.v740sp02, seq("VALUE",
                                            TypeNameOrInfer,
                                            tok(ParenLeftW),
                                            ValueBody,
                                            rparenNoSpace), {also: AlsoIn.OpenABAP});

    const cond = ver(Release.v740sp02, seq("COND",
                                           TypeNameOrInfer,
                                           tok(ParenLeftW),
                                           CondBody,
                                           rparenNoSpace), {also: AlsoIn.OpenABAP});

    const reff = ver(Release.v740sp02, seq("REF",
                                           TypeNameOrInfer,
                                           tok(ParenLeftW),
                                           Source,
                                           optPrio("OPTIONAL"),
                                           rparen), {also: AlsoIn.OpenABAP});

    const exact = ver(Release.v740sp02, seq("EXACT",
                                            TypeNameOrInfer,
                                            tok(ParenLeftW),
                                            Source,
                                            rparen), {also: AlsoIn.OpenABAP});

    const filter = ver(Release.v740sp08,
                       seq("FILTER",
                           TypeNameOrInfer,
                           tok(ParenLeftW),
                           FilterBody,
                           rparen), {also: AlsoIn.OpenABAP});

    const reduce = ver(Release.v740sp08,
                       seq("REDUCE",
                           TypeNameOrInfer,
                           tok(ParenLeftW),
                           ReduceBody,
                           rparen), {also: AlsoIn.OpenABAP});

    const prefix1 = altPrio(tok(WDashW), tok(WPlusW));

    // FILTER and REF cannot be followed by an operator, all others can
    return new SourceChain(this, starPrio(prefix1), altPrio(filter, reff),
                           altPrio(corr, conv, value, cond, exact, swit, reduce, old), altPrio("&", "&&", ArithOperator));
  }
}

/** Source, its operand followed by any number of "operator Source". Written as recursion, a chain of
 *  a few thousand "&&" exhausts the call stack while parsing. Here the chain is matched in a loop and
 *  the nested Source nodes are built afterwards, the result is the same tree as the recursion gives:
 *  Source(a, &&, Source(b, &&, Source(c))). A step with more than one possible result is left to the
 *  recursion, it keeps all of them */
class SourceChain implements IStatementRunnable {
  private readonly source: Source;
  private readonly prefix: IStatementRunnable;
  private readonly terminal: IStatementRunnable;
  private readonly operand: IStatementRunnable;
  private readonly operator: IStatementRunnable;
  private readonly recursive: IStatementRunnable;

  public constructor(source: Source, prefix: IStatementRunnable, terminal: IStatementRunnable,
                     operand: IStatementRunnable, operator: IStatementRunnable) {
    this.source = source;
    this.prefix = prefix;
    this.terminal = terminal;
    this.operand = operand;
    this.operator = operator;
    this.recursive = optPrio(seq(operator, Source));
  }

  public run(r: Result[]): Result[] {
    const result: Result[] = [];
    for (const input of r) {
      const prefixed = this.prefix.run([input]);
      const terminal = this.terminal.run(prefixed);
      if (terminal.length > 0) {
        result.push(...terminal);
        continue;
      }
      const operand = this.operand.run(prefixed);
      if (operand.length === 1) {
        result.push(...this.chain(operand[0]));
      } else if (operand.length > 1) {
        result.push(...this.recursive.run(operand));
      }
    }
    return result;
  }

  private chain(first: Result): Result[] {
    // remaining length at the start of each nested Source, the one after the first operator first
    const starts: number[] = [];
    let current = [first];
    while (current.length === 1) {
      const operator = this.operator.run(current);
      if (operator.length !== 1) {
        if (operator.length > 1) {
          current = this.recursive.run(current);
        }
        break;
      }
      const prefixed = this.prefix.run(operator);
      const terminal = this.terminal.run(prefixed);
      const operand = terminal.length > 0 ? terminal : this.operand.run(prefixed);
      if (operand.length === 0) {
        break;
      } else if (operand.length > 1) {
        current = this.recursive.run(current);
        break;
      }
      starts.push(operator[0].remainingLength());
      current = operand;
      if (terminal.length > 0) {
        break;
      }
    }

    // wrap the nested Source nodes, innermost first
    return current.map(c => {
      for (let i = starts.length - 1; i >= 0; i--) {
        c = c.wrapConsumed(starts[i] - c.remainingLength(), new ExpressionNode(this.source));
      }
      return c;
    });
  }

  public listKeywords(): string[] {
    return [...this.terminal.listKeywords(), ...this.operand.listKeywords()];
  }

  public getUsing(): string[] {
    return [...this.prefix.getUsing(), ...this.terminal.getUsing(), ...this.operand.getUsing(), ...this.operator.getUsing(),
      "expression/Source"];
  }

  public railroad(): string {
    return seq(this.prefix, altPrio(this.terminal, seq(this.operand, this.recursive))).railroad();
  }

  public toStr(): string {
    return seq(this.prefix, altPrio(this.terminal, seq(this.operand, this.recursive))).toStr();
  }

  public first(): string[] {
    return this.prefix.first();
  }
}
