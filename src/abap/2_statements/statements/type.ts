import {IStatement} from "./_statement";
import {str, seq, alt, per, opt, ver} from "../combi";
import * as Expressions from "../expressions";
import {CurrentScope} from "../../syntax/_current_scope";
import {StatementNode} from "../../nodes";
import {Version} from "../../../version";
import {BasicTypes} from "../../syntax/basic_types";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {IStatementRunnable} from "../statement_runnable";
import {TypeTable} from "../../syntax/expressions/type_table";

export class Type implements IStatement {

  public getMatcher(): IStatementRunnable {
    const simple = per(new Expressions.Type(), new Expressions.Decimals(), new Expressions.Length());

    const def = seq(new Expressions.NamespaceSimpleName(),
                    opt(new Expressions.ConstantFieldLength()),
                    opt(alt(simple, new Expressions.TypeTable())));

// todo, BOXED is only allowed with structures inside structures?
    const boxed = ver(Version.v702, str("BOXED"));

    const ret = seq(str("TYPES"), def, opt(boxed));

    return ret;
  }

  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const tt = node.findFirstExpression(Expressions.TypeTable);
    if (tt) {
      return new TypeTable().runSyntax(node, scope, filename);
    }

    const found = new BasicTypes(filename, scope).simpleType(node);
    if (found) {
      return found;
    }

    const fallback = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType("Type, fallback"));
    }

    return undefined;
  }

}