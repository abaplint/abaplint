import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let plus = Combi.plus;
let per = Combi.per;

export class Read extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(seq(str("ASSIGNING"), Reuse.target()),
                     seq(opt(str("REFERENCE")), str("INTO"), Reuse.target()),
                     str("TRANSPORTING NO FIELDS"));

    let index = seq(str("INDEX"), Reuse.source());

    let components = seq(Reuse.field(), str("COMPONENTS"), plus(Reuse.compare()));

    let key = seq(alt(str("WITH KEY"), str("WITH TABLE KEY")), alt(plus(Reuse.compare()), components), opt(str("BINARY SEARCH")));

    let perm = per(alt(index,
                       key,
                       seq(str("FROM"), Reuse.source())),
                   target);

    return seq(str("READ TABLE"),
               Reuse.source(),
               opt(perm));
  }

}