import {Version} from "../../../version";
import {IStatement} from "./_statement";
import {seqs, alts, altPrios, ver, regex as reg, plusPrios, optPrios} from "../combi";
import {MethodDefChanging, MethodDefReturning, Redefinition, MethodName, MethodDefExporting, MethodDefImporting, EventHandler, Abstract, MethodDefRaising, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class MethodDef implements IStatement {

  public getMatcher(): IStatementRunnable {

    const exceptions = seqs("EXCEPTIONS", plusPrios(NamespaceSimpleName));

    const def = ver(Version.v740sp08, seqs("DEFAULT", altPrios("FAIL", "IGNORE")));

    const parameters = seqs(optPrios(altPrios(seqs(Abstract, optPrios("FOR TESTING")), "FINAL", "FOR TESTING", def)),
                            optPrios(MethodDefImporting),
                            optPrios(MethodDefExporting),
                            optPrios(MethodDefChanging),
                            optPrios(MethodDefReturning),
                            optPrios(alts(MethodDefRaising, exceptions)));

// todo, this is only from version something
    const tableFunction = seqs("FOR TABLE FUNCTION", reg(/^\w+?$/));

    const ret = seqs(altPrios("CLASS-METHODS", "METHODS"),
                     MethodName,
                     alts(seqs(optPrios(Abstract), EventHandler),
                          parameters,
                          tableFunction,
                          "NOT AT END OF MODE",
                          optPrios(Redefinition)));

    return ret;
  }

}