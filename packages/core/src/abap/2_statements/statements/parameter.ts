import {IStatement} from "./_statement";
import {verNot, str, seq, opt, altPrio, per, regex as reg, optPrio} from "../combi";
import {Source, Constant, FieldChain, Dynamic, Field, FieldSub, RadioGroupName, Modif, TypeName, SimpleSource1, DatabaseTable, ConstantFieldLength, FieldOffset, FieldLength} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Parameter implements IStatement {

  public getMatcher(): IStatementRunnable {
    const para = altPrio("PARAMETER", "PARAMETERS");
    const def = seq("DEFAULT", altPrio(Constant, FieldChain));
    const radio = seq("RADIOBUTTON GROUP", RadioGroupName);
    const type = seq(altPrio("TYPE", "LIKE"), altPrio(TypeName, Dynamic), optPrio(FieldOffset), optPrio(FieldLength));
    const memory = seq("MEMORY ID", SimpleSource1);
    const listbox = str("AS LISTBOX");
    const cmd = seq("USER-COMMAND", reg(/^[\w\?\/]+$/));
    const modif = seq("MODIF ID", Modif);
    const visible = seq("VISIBLE LENGTH", Constant);
    const length = seq("LENGTH", Constant);
    const match = seq("MATCHCODE OBJECT", Field);
    const decimals = seq("DECIMALS", Source);
    const forTable = seq("FOR TABLE", DatabaseTable, opt("VALUE-REQUEST"));

    const perm = per(type,
                     def,
                     "OBLIGATORY",
                     match,
                     cmd,
                     length,
                     decimals,
                     radio,
                     memory,
                     modif,
                     listbox,
                     visible,
                     forTable,
                     "VALUE CHECK",
                     "NO-DISPLAY",
                     "AS CHECKBOX",
                     "LOWER CASE");

    const ret = seq(para,
                    FieldSub,
                    opt(ConstantFieldLength),
                    opt(perm));

    return verNot(Version.Cloud, ret);
  }

}