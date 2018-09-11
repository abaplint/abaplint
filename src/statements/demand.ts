import {Statement} from "./statement";
import {str, seq, plus, IRunnable} from "../combi";
import {Target, Field} from "../expressions";

export class Demand extends Statement {

  public static get_matcher(): IRunnable {
    let field = seq(new Field(), str("="), new Target());

    return seq(str("DEMAND"),
               plus(field),
               str("FROM CONTEXT"),
               new Field());
  }

}