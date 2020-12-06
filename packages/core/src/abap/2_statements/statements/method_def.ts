import {Version} from "../../../version";
import {IStatement} from "./_statement";
import {str, seqs, alts, altPrio, ver, regex as reg, plusPrio, optPrio} from "../combi";
import {MethodDefChanging, MethodDefReturning, Redefinition, MethodName, MethodDefExporting, MethodDefImporting, EventHandler, Abstract, MethodDefRaising, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class MethodDef implements IStatement {

  public getMatcher(): IStatementRunnable {

    const exceptions = seqs("EXCEPTIONS", plusPrio(new NamespaceSimpleName()));

    const def = ver(Version.v740sp08, seqs("DEFAULT", altPrio(str("FAIL"), str("IGNORE"))));

    const parameters = seqs(optPrio(altPrio(seqs(Abstract, optPrio(str("FOR TESTING"))), str("FINAL"), str("FOR TESTING"), def)),
                            optPrio(new MethodDefImporting()),
                            optPrio(new MethodDefExporting()),
                            optPrio(new MethodDefChanging()),
                            optPrio(new MethodDefReturning()),
                            optPrio(alts(MethodDefRaising, exceptions)));

// todo, this is only from version something
    const tableFunction = seqs("FOR TABLE FUNCTION", reg(/^\w+?$/));

    const ret = seqs(altPrio(str("CLASS-METHODS"), str("METHODS")),
                     MethodName,
                     alts(seqs(optPrio(new Abstract()), EventHandler),
                          parameters,
                          tableFunction,
                          "NOT AT END OF MODE",
                          optPrio(new Redefinition())));

    return ret;
  }

}