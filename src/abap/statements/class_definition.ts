import {Statement} from "./_statement";
import {str, seq, opt, alt, per, plus, IRunnable} from "../combi";
import {ClassName, SuperClassName} from "../expressions";

export class ClassDefinition extends Statement {

  public getMatcher(): IRunnable {
    let create = seq(str("CREATE"), alt(str("PUBLIC"), str("PROTECTED"), str("PRIVATE")));

    let level = alt(str("CRITICAL"), str("HARMLESS"), str("DANGEROUS"));
    let risk = seq(str("RISK LEVEL"), level);

    let time = alt(str("LONG"), str("MEDIUM"), str("SHORT"));
    let duration = seq(str("DURATION"), time);

    let blah = per(alt(str("PUBLIC"), str("LOCAL")),
                   str("FINAL"),
                   str("ABSTRACT"),
                   seq(str("INHERITING FROM"), new SuperClassName()),
                   create,
                   str("FOR TESTING"),
                   risk,
                   str("SHARED MEMORY ENABLED"),
                   duration,
                   seq(opt(str("GLOBAL")), str("FRIENDS"), plus(new ClassName())));

    let def = seq(str("DEFINITION"), opt(blah));

    return seq(str("CLASS"), new ClassName(), def);
  }

}