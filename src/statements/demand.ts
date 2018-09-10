import {Statement} from "./statement";
import {str, seq, plus, IRunnable} from "../combi";
import * as Reuse from "./reuse";
import {Target} from "../expressions";

export class Demand extends Statement {

  public static get_matcher(): IRunnable {
    let field = seq(new Reuse.Field(), str("="), new Target());

    return seq(str("DEMAND"),
               plus(field),
               str("FROM CONTEXT"),
               new Reuse.Field());
  }

}