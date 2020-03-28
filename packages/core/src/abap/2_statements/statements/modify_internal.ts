import {IStatement} from "./_statement";
import {str, seq, opt, alt, per, plus} from "../combi";
import {FSTarget, Target, Source, Dynamic, ComponentCond, FieldSub, SimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyInternal implements IStatement {

  public getMatcher(): IStatementRunnable {
    const index = seq(str("INDEX"), new Source());
    const from = seq(str("FROM"), new Source());
    const transporting = seq(str("TRANSPORTING"),
                             plus(alt(new FieldSub(), new Dynamic())));

    const where = seq(str("WHERE"), new ComponentCond());
    const assigning = seq(str("ASSIGNING"), new FSTarget());
    const using = seq(str("USING KEY"), new SimpleName());
    const additions = per(where, assigning, using);

    const target = alt(new Target(), new Dynamic());

    const options = alt(
      per(index, transporting),
      seq(from, opt(per(index, transporting))),
      seq(per(index, transporting), from, opt(per(index, transporting))));

    const long = seq(str("MODIFY"), opt(str("TABLE")), target, opt(options), opt(additions));

    const simple = seq(str("MODIFY TABLE"), target, from, opt(using));

    return alt(long, simple);
  }

}