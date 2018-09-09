import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class ImportDynpro extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("IMPORT DYNPRO"),
               new Reuse.Target(),
               new Reuse.Target(),
               new Reuse.Target(),
               new Reuse.Target(),
               str("ID"),
               new Reuse.Source());
  }

}