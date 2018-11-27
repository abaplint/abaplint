import {Statement} from "./_statement";
import {str, opt, alt, seq, IStatementRunnable} from "../combi";
import {FSTarget, Target, Field, Source} from "../expressions";

export class Append extends Statement {

  public getMatcher(): IStatementRunnable {
    const assigning = seq(str("ASSIGNING"), new FSTarget());
    const reference = seq(str("REFERENCE INTO"), new Target());
    const sorted = seq(str("SORTED BY"), new Field());

    const range = seq(opt(seq(str("FROM"), new Source())),
                      opt(seq(str("TO"), new Source())));

    return seq(str("APPEND"),
               alt(str("INITIAL LINE"), seq(opt(str("LINES OF")), new Source())),
               opt(range),
               opt(seq(str("TO"), new Target())),
               opt(alt(assigning, reference)),
               opt(str("CASTING")),
               opt(sorted));
  }

}