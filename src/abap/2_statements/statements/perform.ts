import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt, tok, plus, IStatementRunnable} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import * as Expressions from "../expressions";
import {Version} from "../../../version";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../../syntax/_current_scope";

export class Perform implements IStatement {

  public getMatcher(): IStatementRunnable {
    const using = seq(str("USING"), plus(new Expressions.Source()));
    const tables = seq(str("TABLES"), plus(new Expressions.Source()));
    const changing = seq(str("CHANGING"), plus(new Expressions.Source()));
    const level = seq(str("LEVEL"), new Expressions.Source());
    const commit = alt(seq(str("ON COMMIT"), opt(level)),
                       str("ON ROLLBACK"));

    const short = verNot(Version.Cloud, seq(new Expressions.FormName(),
                                            tok(ParenLeft),
                                            new Expressions.IncludeName(),
                                            tok(ParenRightW)));

    const program = seq(str("IN PROGRAM"), opt(alt(new Expressions.Dynamic(), new Expressions.IncludeName())));

    const found = str("IF FOUND");

    const full = seq(alt(new Expressions.FormName(), new Expressions.Dynamic()),
                     opt(verNot(Version.Cloud, program)));

    const ret = seq(str("PERFORM"),
                    alt(short, full),
                    opt(found),
                    opt(tables),
                    opt(using),
                    opt(changing),
                    opt(found),
                    opt(commit));

    return ret;
  }

  public runSyntax(node: StatementNode, scope: CurrentScope, _filename: string): void {
    if (!(node.get() instanceof Perform)) {
      throw new Error("checkPerform unexpected node type");
    }

    if (node.findFirstExpression(Expressions.IncludeName)) {
      return; // in external program, not checked, todo
    }

    if (node.findFirstExpression(Expressions.Dynamic)) {
      return; // todo, maybe some parts can be checked
    }

    const expr = node.findFirstExpression(Expressions.FormName);
    if (expr === undefined) {
      return; // it might be a dynamic call
    }

    const name = expr.getFirstToken().getStr();

// todo, also check parameters match
    if (scope.findFormDefinition(name) === undefined) {
      throw new Error("FORM definition \"" + name + "\" not found");
    }
  }

}