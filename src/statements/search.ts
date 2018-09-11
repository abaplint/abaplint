import {Statement} from "./statement";
import {str, seq, opt, alt, per, IRunnable} from "../combi";
import {Source} from "../expressions";

export class Search extends Statement {

  public static get_matcher(): IRunnable {
    let starting = seq(str("STARTING AT"), new Source());
    let ending = seq(str("ENDING AT"), new Source());
    let mark = str("AND MARK");

    let mode = alt(str("IN BYTE MODE"), str("IN CHARACTER MODE"));

    let ret = seq(str("SEARCH"),
                  new Source(),
                  str("FOR"),
                  new Source(),
                  opt(per(mode, starting, ending, mark)));

    return ret;
  }

}