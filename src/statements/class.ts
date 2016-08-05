import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let per = Combi.per;

export class Class extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let create = seq(str("CREATE"), alt(str("PUBLIC"), str("PROTECTED"), str("PRIVATE")));

    let level = alt(str("CRITICAL"), str("HARMLESS"));
    let risk = opt(seq(str("RISK LEVEL"), level));

    let time = alt(str("LONG"), str("MEDIUM"), str("SHORT"));
    let duration = opt(seq(str("DURATION"), time));

    let blah = per(alt(str("PUBLIC"), str("LOCAL")),
                   alt(str("FINAL"), str("ABSTRACT")),
                   seq(str("INHERITING FROM"), Reuse.class_name()),
                   create,
                   seq(str("FOR TESTING"), risk, duration, risk),
                   seq(opt(str("GLOBAL")), str("FRIENDS"), Reuse.class_name()));

    let def = seq(str("DEFINITION"),
                  opt(alt(str("LOAD"),
                          str("DEFERRED"),
                          blah)));

    return seq(str("CLASS"), Reuse.class_name(), alt(def, str("IMPLEMENTATION")));
  }

}