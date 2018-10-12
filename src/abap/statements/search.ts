import {Statement} from "./statement";
import {verNot, str, seq, opt, alt, per, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class Search extends Statement {

  public get_matcher(): IRunnable {
    let starting = seq(str("STARTING AT"), new Source());
    let ending = seq(str("ENDING AT"), new Source());
    let mark = str("AND MARK");

    let mode = alt(str("IN BYTE MODE"), str("IN CHARACTER MODE"));

    let ret = seq(str("SEARCH"),
                  new Source(),
                  str("FOR"),
                  new Source(),
                  opt(per(mode, starting, ending, mark)));

    return verNot(Version.Cloud, ret);
  }

}