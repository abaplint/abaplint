import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class CreateData extends Statement {

  public static get_matcher(): Combi.IRunnable {
// todo, similar to DATA or TYPES?
    let type = alt(str("LIKE"),
                   str("TYPE"),
                   str("TYPE HANDLE"),
                   str("TYPE REF TO"),
                   str("LIKE TABLE OF"),
                   str("TYPE TABLE OF"),
                   str("TYPE STANDARD TABLE OF"),
                   str("LIKE STANDARD TABLE OF"),
                   str("LIKE LINE OF"));

    let length = seq(str("LENGTH"), new Reuse.Source());
    let decimals = seq(str("DECIMALS"), new Reuse.Source());

    let key = str("WITH DEFAULT KEY");

    let ret = seq(str("CREATE DATA"),
                  new Reuse.Target(),
                  opt(seq(type, alt(new Reuse.Source(), new Reuse.Dynamic()))),
                  opt(key),
                  opt(length),
                  opt(decimals));

    return ret;
  }

}