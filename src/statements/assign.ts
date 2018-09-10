import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, opt, tok, IRunnable} from "../combi";
import {Arrow} from "../tokens/";
import {FSTarget, Target} from "../expressions";

export class Assign extends Statement {

  public static get_matcher(): IRunnable {
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
                  opt(seq(new Target(), str("INCREMENT"))),
                  source,
                  str("TO"),
                  new FSTarget(),
                  casting,
                  opt(range));

    return ret;
  }

}