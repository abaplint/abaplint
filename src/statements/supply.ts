import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let plus = Combi.plus;

export class Supply extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let field = seq(new Reuse.Field(), str("="), new Reuse.Source());

    return seq(str("SUPPLY"),
               plus(field),
               str("TO CONTEXT"),
               new Reuse.Field());
  }

}