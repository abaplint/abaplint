import {seq, opt, altPrio, plus} from "../combi";
import {FieldChain, TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export function lobColumns(): IStatementRunnable {
  return altPrio(
    seq("FOR", opt("OTHER"), altPrio("BLOB", "CLOB"), "COLUMNS"),
    seq("FOR", "ALL", opt("OTHER"), altPrio("BLOB", "CLOB"), "COLUMNS"),
    seq("FOR", "ALL", "COLUMNS"),
    seq("FOR", "COLUMNS", plus(FieldChain)));
}

export function lobKind(): IStatementRunnable {
  return altPrio("LOCATOR", "READER", "WRITER", seq("LOB", "HANDLE"));
}

export function lobHandleType(): IStatementRunnable {
  return seq("TYPE", TypeName, opt("READ-ONLY"),
             plus(seq(lobKind(), lobColumns())));
}
