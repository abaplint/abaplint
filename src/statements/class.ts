import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class Class extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let create = seq(str("CREATE"), alt(str("PUBLIC"), str("PRIVATE")));

    let level = alt(str("CRITICAL"), str("HARMLESS"));
    let risk = opt(seq(str("RISK LEVEL"), level));

    let time = alt(str("LONG"), str("MEDIUM"), str("SHORT"));
    let duration = opt(seq(str("DURATION"), time));

    let def = seq(str("CLASS"),
                  Reuse.field(),
                  str("DEFINITION"),
                  opt(alt(str("PUBLIC"), str("LOCAL"))),
                  opt(str("FINAL")),
                  opt(str("LOAD")),
                  opt(seq(str("INHERITING FROM"), Reuse.field())),
                  opt(str("DEFERRED")),
                  opt(create),
                  opt(seq(str("FOR TESTING"), risk, duration, risk)),
                  opt(str("FINAL")),
                  opt(str("ABSTRACT")),
                  opt(create),
                  opt(seq(str("FRIENDS"), Reuse.field())));

    let impl = seq(str("CLASS"), Reuse.field(), str("IMPLEMENTATION"));

    return alt(def, impl);
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new Class(tokens);
    }
    return undefined;
  }
}