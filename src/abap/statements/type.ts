import {Statement} from "./_statement";
import {str, seq, alt, per, opt, ver, IStatementRunnable} from "../combi";
import {NamespaceSimpleName, ConstantFieldLength, Type as eType, TypeTable, Decimals, Length} from "../expressions";
import * as Expressions from "../expressions";
import {CurrentScope} from "../syntax/_current_scope";
import {StatementNode} from "../nodes";
import {Version} from "../../version";
import {BasicTypes} from "../syntax/basic_types";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";

export class Type extends Statement {

  public getMatcher(): IStatementRunnable {
    const simple = per(new eType(), new Decimals(), new Length());

    const def = seq(new NamespaceSimpleName(),
                    opt(new ConstantFieldLength()),
                    opt(alt(simple, new TypeTable())));

// todo, BOXED is only allowed with structures inside structures?
    const boxed = ver(Version.v702, str("BOXED"));

    const ret = seq(alt(str("TYPE"), str("TYPES")), def, opt(boxed));

    return ret;
  }

  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const tt = node.findFirstExpression(TypeTable);
    if (tt) {
      const tts = tt.get() as TypeTable;
      return tts.runSyntax(node, scope, filename);
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