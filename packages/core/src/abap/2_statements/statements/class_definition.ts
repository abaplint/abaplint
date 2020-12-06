import {IStatement} from "./_statement";
import {seqs, opts, alts, pers, ver} from "../combi";
import {ClassName, SuperClassName, ClassGlobal, ClassFinal, SimpleName, ClassFriends} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDefinition implements IStatement {

  public getMatcher(): IStatementRunnable {
    const create = seqs("CREATE", alts("PUBLIC", "PROTECTED", "PRIVATE"));

    const level = alts("CRITICAL", "HARMLESS", "DANGEROUS");
    const risk = seqs("RISK LEVEL", level);

    const time = alts("LONG", "MEDIUM", "SHORT");
    const duration = seqs("DURATION", time);

    const blah = pers(ClassGlobal,
                      ClassFinal,
                      "ABSTRACT",
                      seqs("INHERITING FROM", SuperClassName),
                      create,
                      "FOR TESTING",
                      risk,
                      "SHARED MEMORY ENABLED",
                      duration,
                      ver(Version.v754, seqs("FOR BEHAVIOR OF", SimpleName)),
                      ClassFriends);

    const def = seqs("DEFINITION", opts(blah));

    return seqs("CLASS", ClassName, def);
  }

}