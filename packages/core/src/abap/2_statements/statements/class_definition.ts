import {IStatement} from "./_statement";
import {seq, alt, per, ver, altPrio, optPrio} from "../combi";
import {ClassName, SuperClassName, ClassGlobal, ClassFinal, ClassFriends, NamespaceSimpleName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDefinition implements IStatement {

  public getMatcher(): IStatementRunnable {
    const create = seq("CREATE", altPrio("PUBLIC", "PROTECTED", "PRIVATE"));

    const level = altPrio("CRITICAL", "HARMLESS", "DANGEROUS");
    const risk = seq("RISK LEVEL", level);

    const time = alt("LONG", "MEDIUM", "SHORT");
    const duration = seq("DURATION", time);

    const blah = per(ClassGlobal,
                     ClassFinal,
                     "ABSTRACT",
                     seq("INHERITING FROM", SuperClassName),
                     create,
                     "FOR TESTING",
                     risk,
                     "SHARED MEMORY ENABLED",
                     duration,
                     ver(Version.v754, seq("FOR BEHAVIOR OF", NamespaceSimpleName)),
                     ClassFriends);

    const def = seq("DEFINITION", optPrio(blah));

    return seq("CLASS", ClassName, def);
  }

}