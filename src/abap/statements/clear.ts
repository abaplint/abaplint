import {Statement} from "./_statement";
import {str, seq, opt, alt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Clear extends Statement {

  public getMatcher(): IRunnable {
    const wit = seq(str("WITH"), new Source());

    const mode = alt(str("IN CHARACTER MODE"),
                     str("IN BYTE MODE"));

    return seq(str("CLEAR"),
               new Target(),
               opt(wit),
               opt(mode));
  }

}