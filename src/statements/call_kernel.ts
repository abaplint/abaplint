import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, star, IRunnable} from "../combi";

export class CallKernel extends Statement {

  public static get_matcher(): IRunnable {

    let field = seq(str("ID"),
                    new Reuse.Source(),
                    str("FIELD"),
                    new Reuse.Source());

    let ret = seq(str("CALL"),
                  alt(new Reuse.Constant(), new Reuse.Field()),
                  star(field));

    return ret;
  }

}