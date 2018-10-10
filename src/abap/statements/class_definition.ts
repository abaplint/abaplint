import {Statement} from "./statement";
import {str, seq, opt, alt, per, plus, IRunnable} from "../combi";
import {ClassName} from "../expressions";

export class ClassDefinition extends Statement {

  public static get_matcher(): IRunnable {
    let create = seq(str("CREATE"), alt(str("PUBLIC"), str("PROTECTED"), str("PRIVATE")));

    let level = alt(str("CRITICAL"), str("HARMLESS"), str("DANGEROUS"));
    let risk = seq(str("RISK LEVEL"), level);

    let time = alt(str("LONG"), str("MEDIUM"), str("SHORT"));
    let duration = seq(str("DURATION"), time);

    let blah = per(alt(str("PUBLIC"), str("LOCAL")),
                   str("FINAL"),
                   str("ABSTRACT"),
                   seq(str("INHERITING FROM"), new ClassName()),
                   create,
                   str("FOR TESTING"),
                   risk,
                   str("SHARED MEMORY ENABLED"),
                   duration,
                   seq(opt(str("GLOBAL")), str("FRIENDS"), plus(new ClassName())));

    let def = seq(str("DEFINITION"),
                  opt(alt(str("LOAD"),
                          seq(str("DEFERRED"), opt(str("PUBLIC"))),
                          blah)));

    return seq(str("CLASS"), new ClassName(), def);
  }

}