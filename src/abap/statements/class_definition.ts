import {Statement} from "./_statement";
import {str, seq, opt, alt, per, plus, IStatementRunnable, ver} from "../combi";
import {ClassName, SuperClassName, Global, ClassFinal, SimpleName} from "../expressions";
import {Version} from "../../version";

export class ClassDefinition extends Statement {

  public getMatcher(): IStatementRunnable {
    const create = seq(str("CREATE"), alt(str("PUBLIC"), str("PROTECTED"), str("PRIVATE")));

    const level = alt(str("CRITICAL"), str("HARMLESS"), str("DANGEROUS"));
    const risk = seq(str("RISK LEVEL"), level);

    const time = alt(str("LONG"), str("MEDIUM"), str("SHORT"));
    const duration = seq(str("DURATION"), time);

    const blah = per(new Global(),
                     new ClassFinal(),
                     str("ABSTRACT"),
                     seq(str("INHERITING FROM"), new SuperClassName()),
                     create,
                     str("FOR TESTING"),
                     risk,
                     str("SHARED MEMORY ENABLED"),
                     duration,
                     ver(Version.v755, seq(str("FOR BEHAVIOR OF"), new SimpleName())),
                     seq(opt(str("GLOBAL")), str("FRIENDS"), plus(new ClassName())));

    const def = seq(str("DEFINITION"), opt(blah));

    return seq(str("CLASS"), new ClassName(), def);
  }

}