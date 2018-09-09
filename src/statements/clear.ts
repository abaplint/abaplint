import {Statement} from "./statement";
import {str, seq, opt, alt, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Clear extends Statement {

  public static get_matcher(): IRunnable {
    let wit = seq(str("WITH"), new Reuse.Source());

    let mode = alt(str("IN CHARACTER MODE"),
                   str("IN BYTE MODE"));

    return seq(str("CLEAR"),
               new Reuse.Target(),
               opt(wit),
               opt(mode));
  }

}