import {Statement} from "./statement";
import {str, seq, alt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Translate extends Statement {

  public static get_matcher(): IRunnable {
    let cas = seq(str("TO"),
                  alt(str("UPPER"), str("LOWER")),
                  str("CASE"));

    let using = seq(str("USING"), new Source());

    return seq(str("TRANSLATE"),
               new Target(),
               alt(cas, using));
  }

}