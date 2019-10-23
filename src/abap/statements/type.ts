import {Statement} from "./_statement";
import {str, seq, alt, per, opt, IStatementRunnable} from "../combi";
import {NamespaceSimpleName, FieldLength, Type as eType, TypeTable, Decimals, Length} from "../expressions";
import {Scope} from "../syntax/_scope";
import {StatementNode} from "../nodes";
import {BasicTypes} from "../syntax/basic_types";

export class Type extends Statement {

  public getMatcher(): IStatementRunnable {
    const simple = per(new eType(), new Decimals(), new Length());

    const def = seq(new NamespaceSimpleName(),
                    opt(new FieldLength()),
                    opt(alt(simple, new TypeTable())));

    const ret = seq(alt(str("TYPE"), str("TYPES")), def);

    return ret;
  }

  public runSyntax(node: StatementNode, scope: Scope, filename: string): void {
    const tt = node.findFirstExpression(TypeTable);
    if (tt) {
      const tts = tt.get() as TypeTable;
      const found1 = tts.runSyntax(node, scope, filename);
      scope.addType(found1);
      return;
    }

    // todo
    const found = new BasicTypes(filename, scope).simpleType(node);
    scope.addType(found);
  }

}