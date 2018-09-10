import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, opt, IRunnable} from "../combi";

export class Type extends Statement {

  public static get_matcher(): IRunnable {
    let def = seq(new Reuse.NamespaceSimpleName(),
                  opt(new Reuse.FieldLength()),
                  opt(alt(new Reuse.Type(), new Reuse.TypeTable())));

    let ret = seq(alt(str("TYPE"), str("TYPES")), def);

    return ret;
  }

}