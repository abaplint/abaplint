import {CDSAnnotation} from ".";
import {Version} from "../..";
import {Expression, seq, star, opt, ver} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSName} from "./cds_name";
import {CDSSelect} from "./cds_select";
import {CDSWithParameters} from "./cds_with_parameters";

export class CDSDefineView extends Expression {
  public getRunnable(): IStatementRunnable {
    const columnAlias = seq("(", CDSName, star(seq(",", CDSName)), ")");
    return seq(star(CDSAnnotation),
               opt("DEFINE"),
               opt("ROOT"),
               "VIEW",
               ver(Version.v755, opt("ENTITY")),
               CDSName,
               opt(columnAlias),
               opt(CDSWithParameters),
               "AS",
               CDSSelect,
               opt(";"));
  }
}