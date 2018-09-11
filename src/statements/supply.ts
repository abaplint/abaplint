import {Statement} from "./statement";
import {str, seq, plus, IRunnable} from "../combi";
import {Source, Field} from "../expressions";

export class Supply extends Statement {

  public static get_matcher(): IRunnable {
    let field = seq(new Field(), str("="), new Source());

    return seq(str("SUPPLY"),
               plus(field),
               str("TO CONTEXT"),
               new Field());
  }

}