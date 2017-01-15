import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let plus = Combi.plus;

export class InterfaceDef extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let val = seq(new Reuse.Field(), str("="), new Reuse.Source());

    let dataValues = seq(str("DATA VALUES"),
                         plus(val));

    let options = alt(seq(str("ABSTRACT METHODS"), plus(new Reuse.Field())),
                      str("ALL METHODS ABSTRACT"),
                      str("ALL METHODS FINAL"),
                      str("PARTIALLY IMPLEMENTED"));

    return seq(str("INTERFACES"),
               new Reuse.Field(),
               opt(options),
               opt(dataValues));
  }

}