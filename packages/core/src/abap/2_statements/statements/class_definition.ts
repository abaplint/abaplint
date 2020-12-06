import {IStatement} from "./_statement";
import {seq, opt, alt, pers, vers} from "../combi";
import {ClassName, SuperClassName, ClassGlobal, ClassFinal, SimpleName, ClassFriends} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDefinition implements IStatement {

  public getMatcher(): IStatementRunnable {
    const create = seq("CREATE", alt("PUBLIC", "PROTECTED", "PRIVATE"));

    const level = alt("CRITICAL", "HARMLESS", "DANGEROUS");
    const risk = seq("RISK LEVEL", level);

    const time = alt("LONG", "MEDIUM", "SHORT");
    const duration = seq("DURATION", time);

    const blah = pers(ClassGlobal,
                      ClassFinal,
                      "ABSTRACT",
                      seq("INHERITING FROM", SuperClassName),
                      create,
                      "FOR TESTING",
                      risk,
                      "SHARED MEMORY ENABLED",
                      duration,
                      vers(Version.v754, seq("FOR BEHAVIOR OF", SimpleName)),
                      ClassFriends);

    const def = seq("DEFINITION", opt(blah));

    return seq("CLASS", ClassName, def);
  }

}