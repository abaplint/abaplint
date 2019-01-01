import {Statement} from "./_statement";
import {str, seq, opt, alt, per, plus, IStatementRunnable} from "../combi";
import {FSTarget, Target, Source, Dynamic, ComponentCond, FieldSub} from "../expressions";

export class ModifyInternal extends Statement {

  public getMatcher(): IStatementRunnable {
    const index = seq(str("INDEX"), new Source());
    const from = seq(str("FROM"), new Source());
    const transporting = seq(str("TRANSPORTING"),
                             plus(alt(new FieldSub(), new Dynamic())));

    const where = seq(str("WHERE"), new ComponentCond());
    const assigning = seq(str("ASSIGNING"), new FSTarget());

    const target = alt(new Target(), new Dynamic());

    const options = alt(
      per(index, transporting),
      seq(from, per(index, transporting)),
      seq(per(index, transporting), from, opt(per(index, transporting))));

    const long = seq(str("MODIFY"), opt(str("TABLE")), target, opt(options), opt(per(where, assigning)));

    const simple = seq(str("MODIFY TABLE"), target, from);

    return alt(long, simple);
  }

}