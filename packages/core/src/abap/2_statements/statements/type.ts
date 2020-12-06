import {IStatement} from "./_statement";
import {str, seqs, alts, per, opt, ver} from "../combi";
import * as Expressions from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Type implements IStatement {

  public getMatcher(): IStatementRunnable {
    const simple = per(new Expressions.Type(), new Expressions.Decimals(), new Expressions.Length());

    const def = seqs(Expressions.NamespaceSimpleName,
                     opt(new Expressions.ConstantFieldLength()),
                     opt(alts(simple, Expressions.TypeTable)));

// todo, BOXED is only allowed with structures inside structures?
    const boxed = ver(Version.v702, str("BOXED"));

    const ret = seqs("TYPES", def, opt(boxed));

    return ret;
  }

}