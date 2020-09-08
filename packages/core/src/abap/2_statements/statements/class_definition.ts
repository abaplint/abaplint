import {IStatement} from "./_statement";
import {str, seq, opt, alt, per, plus, ver} from "../combi";
import {ClassName, SuperClassName, ClassGlobal, ClassFinal, SimpleName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDefinition implements IStatement {

  public getMatcher(): IStatementRunnable {
    const create = seq(str("CREATE"), alt(str("PUBLIC"), str("PROTECTED"), str("PRIVATE")));

    const level = alt(str("CRITICAL"), str("HARMLESS"), str("DANGEROUS"));
    const risk = seq(str("RISK LEVEL"), level);

    const time = alt(str("LONG"), str("MEDIUM"), str("SHORT"));
    const duration = seq(str("DURATION"), time);

    const blah = per(new ClassGlobal(),
                     new ClassFinal(),
                     str("ABSTRACT"),
                     seq(str("INHERITING FROM"), new SuperClassName()),
                     create,
                     str("FOR TESTING"),
                     risk,
                     str("SHARED MEMORY ENABLED"),
                     duration,
                     ver(Version.v754, seq(str("FOR BEHAVIOR OF"), new SimpleName())),
                     seq(opt(str("GLOBAL")), str("FRIENDS"), plus(new ClassName())));

    const def = seq(str("DEFINITION"), opt(blah));

    return seq(str("CLASS"), new ClassName(), def);
  }

}