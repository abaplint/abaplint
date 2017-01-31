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

    let tableField = seq(str("TABLE FIELD"), new Reuse.Dynamic());

    let source = alt(seq(new Reuse.Source(), opt(seq(tok(Arrow), new Reuse.Dynamic()))),
                     component,
                     tableField,
                     seq(new Reuse.Dynamic(), opt(seq(tok(Arrow), alt(new Reuse.Field(), new Reuse.Dynamic())))));

    let type = seq(str("TYPE"), alt(new Reuse.Dynamic(), new Reuse.Source()));
    let like = seq(str("LIKE"), alt(new Reuse.Dynamic(), new Reuse.Source()));
    let handle = seq(str("TYPE HANDLE"), new Reuse.Source());
    let range = seq(str("RANGE"), new Reuse.Field());
    let decimals = seq(str("DECIMALS"), new Reuse.Source());

    let casting = seq(opt(str("CASTING")), opt(alt(type, like, range, handle, decimals)));

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