import {Statement} from "./statement";
import {str, seq, alt, opt, per, IRunnable} from "../combi";
import {FSTarget, Target, Source, Dynamic} from "../expressions";

export class InsertInternal extends Statement {

  public get_matcher(): IRunnable {
    let target = alt(new Source(), new Dynamic());
    let assigning = seq(str("ASSIGNING"), new FSTarget());
    let ref = seq(str("REFERENCE INTO"), new Target());
    let index = seq(str("INDEX"), new Source());
    let initial = str("INITIAL LINE");
    let into = seq(str("INTO"), opt(str("TABLE")), new Source());

    let to = seq(str("TO"), new Source());

    let from = seq(str("FROM"),
                   new Source(),
                   opt(to));

    let foo = per(into,
                  ref,
                  index,
                  assigning);

    let lines = seq(opt(str("LINES OF")),
                    target,
                    opt(from));

    let ret = seq(str("INSERT"),
                  alt(initial,
                      new Target(),
                      lines),
                  foo);

    return ret;
  }

}