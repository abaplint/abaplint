import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let per = Combi.per;

export class Describe extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let table = seq(str("TABLE"),
                    new Reuse.Source(),
                    opt(seq(str("LINES"), new Reuse.Target())));

    let mode = alt(str("IN BYTE MODE"), str("IN CHARACTER MODE"));

    let field = seq(str("FIELD"),
                    new Reuse.Source(),
                    per(seq(str("TYPE"), new Reuse.Target(), opt(seq(str("COMPONENTS"), new Reuse.Target()))),
                        seq(str("LENGTH"), new Reuse.Target(), mode),
                        seq(str("INTO"), new Reuse.Target())));

    let distance = seq(str("DISTANCE BETWEEN"),
                       new Reuse.Source(),
                       str("AND"),
                       new Reuse.Source(),
                       str("INTO"),
                       new Reuse.Target(),
                       str("IN BYTE MODE"));

    let mask = seq(str("FIELD"), new Reuse.Source(), str("EDIT MASK"), new Reuse.Target());

    return seq(str("DESCRIBE"), alt(table, field, mask, distance));
  }

}