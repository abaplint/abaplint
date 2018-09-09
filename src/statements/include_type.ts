import {Statement} from "./statement";
import {str, seq, opt, alt, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class IncludeType extends Statement {

  public static get_matcher(): IRunnable {
    let tas = seq(str("AS"), new Reuse.Field());

    let renaming = seq(str("RENAMING WITH SUFFIX"), new Reuse.Source());

    let ret = seq(str("INCLUDE"),
                  alt(str("TYPE"), str("STRUCTURE")),
                  new Reuse.TypeName(),
                  opt(tas),
                  opt(renaming));

    return ret;
  }

}