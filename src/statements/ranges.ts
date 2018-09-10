import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class Ranges extends Statement {

  public static get_matcher(): IRunnable {
    let occurs = seq(str("OCCURS"), new Reuse.Source());

    return seq(str("RANGES"),
               new Reuse.SimpleName(),
               str("FOR"),
               new Reuse.FieldSub(),
               opt(occurs));
  }

}