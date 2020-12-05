import {IStatement} from "./_statement";
import {str, seqs, opt, alt, per, ver} from "../combi";
import {ClassName, SuperClassName, ClassGlobal, ClassFinal, SimpleName, ClassFriends} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDefinition implements IStatement {

  public getMatcher(): IStatementRunnable {
    const create = seqs("CREATE", alt(str("PUBLIC"), str("PROTECTED"), str("PRIVATE")));

    const level = alt(str("CRITICAL"), str("HARMLESS"), str("DANGEROUS"));
    const risk = seqs("RISK LEVEL", level);

    const time = alt(str("LONG"), str("MEDIUM"), str("SHORT"));
    const duration = seqs("DURATION", time);

    const blah = per(new ClassGlobal(),
                     new ClassFinal(),
                     str("ABSTRACT"),
                     seqs("INHERITING FROM", SuperClassName),
                     create,
                     str("FOR TESTING"),
                     risk,
                     str("SHARED MEMORY ENABLED"),
                     duration,
                     ver(Version.v754, seqs("FOR BEHAVIOR OF", SimpleName)),
                     new ClassFriends());

    const def = seqs("DEFINITION", opt(blah));

    return seqs("CLASS", ClassName, def);
  }

}