import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let plus = Combi.plus;
let per = Combi.per;

export class Read extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(seq(str("ASSIGNING"), new Reuse.Target()),
                     seq(opt(str("REFERENCE")), str("INTO"), new Reuse.Target()),
                     str("TRANSPORTING NO FIELDS"));

    let index = seq(str("INDEX"), new Reuse.Source());

    let components = seq(new Reuse.Field(), str("COMPONENTS"), plus(new Reuse.Compare()));

    let key = seq(alt(str("WITH KEY"), str("WITH TABLE KEY")),
                  alt(plus(new Reuse.Compare()),
                      components,
                      new Reuse.FieldSub(),
                      new Reuse.FieldSymbol()));

    let perm = per(alt(index,
                       key,
                       seq(str("FROM"), new Reuse.Source())),
                   target,
                   str("CASTING"),
                   seq(str("TRANSPORTING"), plus(new Reuse.Field())),
                   str("BINARY SEARCH"));

    return seq(str("READ TABLE"),
               new Reuse.Source(),
               opt(perm));
  }

}