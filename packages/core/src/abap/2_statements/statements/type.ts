import {IStatement} from "./_statement";
import {seq, alt, per, opt, ver} from "../combi";
import * as Expressions from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Type implements IStatement {

  public getMatcher(): IStatementRunnable {
    const simple = per(Expressions.Type, Expressions.Decimals, Expressions.Length);

    const def = seq(Expressions.NamespaceSimpleName,
                    opt(Expressions.ConstantFieldLength),
                    opt(alt(simple, Expressions.TypeTable, Expressions.TypeStructure)));

// todo, BOXED is only allowed with structures inside structures?
    const boxed = ver(Version.v702, "BOXED");

    const ret = seq("TYPES", def, opt(boxed));

    return ret;
  }

}