import {IStatement} from "./_statement";
import {str, seq, alt, per, opt, ver} from "../combi";
import * as Expressions from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

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

}