import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";
import {Arrow} from "../tokens/";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let tok = Combi.tok;

export class Assign extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let component = seq(str("COMPONENT"),
                        new Reuse.Source(),
                        str("OF STRUCTURE"),
                        new Reuse.Source());

    let source = alt(seq(new Reuse.Source(), opt(seq(tok(Arrow), new Reuse.Dynamic()))),
                     component,
                     seq(new Reuse.Dynamic(), opt(seq(tok(Arrow), new Reuse.Field()))));

    let type = seq(str("TYPE"), alt(new Reuse.Dynamic(), new Reuse.Source()));

    let handle = seq(str("TYPE HANDLE"), new Reuse.Field());

    let range = seq(str("RANGE"), new Reuse.Field());

    let casting = seq(opt(str("CASTING")), opt(alt(type, range, handle)));

    let ret = seq(str("ASSIGN"),
                  opt(seq(new Reuse.Target(), str("INCREMENT"))),
                  source,
                  str("TO"),
                  new Reuse.FSTarget(),
                  casting,
                  opt(range));

    return ret;
  }

}