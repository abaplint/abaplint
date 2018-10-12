import {Statement} from "./statement";
import {str, seq, alt, opt, IRunnable} from "../combi";
import {Target} from "../expressions";

export class GetTime extends Statement {

  public get_matcher(): IRunnable {
    let options = seq(alt(str("STAMP FIELD"), str("FIELD")), new Target());

    return seq(str("GET TIME"), opt(options));
  }

}