import {Statement} from "./_statement";
import {str, seq, alt, opt, per, IRunnable} from "../combi";
import {FSTarget, Target, Source, Dynamic} from "../expressions";

export class InsertInternal extends Statement {

  public getMatcher(): IRunnable {
    const target = alt(new Source(), new Dynamic());
    const assigning = seq(str("ASSIGNING"), new FSTarget());
    const ref = seq(str("REFERENCE INTO"), new Target());
    const index = seq(str("INDEX"), new Source());
    const initial = str("INITIAL LINE");
    const into = seq(str("INTO"), opt(str("TABLE")), new Source());

    const to = seq(str("TO"), new Source());

    const from = seq(str("FROM"),
                     new Source(),
                     opt(to));

    const foo = per(into,
                    ref,
                    index,
                    assigning);

    const lines = seq(opt(str("LINES OF")),
                      target,
                      opt(from));

    const ret = seq(str("INSERT"),
                    alt(initial,
                        new Target(),
                        lines),
                    foo);

    return ret;
  }

}