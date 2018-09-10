import {Statement} from "./statement";
import {str, seq, plus, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Supply extends Statement {

  public static get_matcher(): IRunnable {
    let field = seq(new Reuse.Field(), str("="), new Reuse.Source());

    return seq(str("SUPPLY"),
               plus(field),
               str("TO CONTEXT"),
               new Reuse.Field());
  }

}