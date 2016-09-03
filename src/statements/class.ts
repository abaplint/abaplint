import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let per = Combi.per;
let plus = Combi.plus;

export class Class extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let create = seq(str("CREATE"), alt(str("PUBLIC"), str("PROTECTED"), str("PRIVATE")));

    let level = alt(str("CRITICAL"), str("HARMLESS"), str("DANGEROUS"));
    let risk = seq(str("RISK LEVEL"), level);

    let time = alt(str("LONG"), str("MEDIUM"), str("SHORT"));
    let duration = seq(str("DURATION"), time);

    let blah = per(alt(str("PUBLIC"), str("LOCAL")),
                   alt(str("FINAL"), str("ABSTRACT")),
                   seq(str("INHERITING FROM"), Reuse.class_name()),
                   create,
                   str("FOR TESTING"),
                   risk,
                   duration,
                   seq(opt(str("GLOBAL")), str("FRIENDS"), plus(Reuse.class_name())));

    let def = seq(str("DEFINITION"),
                  opt(alt(str("LOAD"),
                          str("DEFERRED"),
                          blah)));

    return seq(str("CLASS"), Reuse.class_name(), alt(def, str("IMPLEMENTATION")));
  }

  public isStructure() {
    if (/DEFINITION DEFERRED/.test(this.concatTokens().toUpperCase())
        || /DEFINITION LOAD/.test(this.concatTokens().toUpperCase())
        || /DEFINITION LOCAL/.test(this.concatTokens().toUpperCase())) {
      return false;
    }

    return true;
  }

  public isValidParent(s) {
    return s === undefined;
  }

  public indentationEnd() {
    return this.isStructure() ? 2 : 0;
  }

}