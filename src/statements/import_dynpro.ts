import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";
import {Target} from "../expressions";

export class ImportDynpro extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("IMPORT DYNPRO"),
               new Target(),
               new Target(),
               new Target(),
               new Target(),
               str("ID"),
               new Reuse.Source());
  }

}