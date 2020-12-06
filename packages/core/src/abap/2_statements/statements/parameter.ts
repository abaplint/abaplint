import {IStatement} from "./_statement";
import {verNot, str, seqs, opt, altPrio, per, regex as reg} from "../combi";
import {Source, Constant, FieldChain, Dynamic, Field, FieldLength, FieldSub, RadioGroupName, Modif, TypeName, SimpleSource} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Parameter implements IStatement {

  public getMatcher(): IStatementRunnable {
    const para = altPrio(str("PARAMETER"), str("PARAMETERS"));
    const def = seqs("DEFAULT", altPrio(new Constant(), new FieldChain()));
    const radio = seqs("RADIOBUTTON GROUP", RadioGroupName);
    const type = seqs(altPrio(str("TYPE"), str("LIKE")), altPrio(new TypeName(), new Dynamic()));
    const memory = seqs("MEMORY ID", SimpleSource);
    const listbox = str("AS LISTBOX");
    const cmd = seqs("USER-COMMAND", reg(/^\w+$/));
    const modif = seqs("MODIF ID", Modif);
    const visible = seqs("VISIBLE LENGTH", Constant);
    const length = seqs("LENGTH", Constant);
    const match = seqs("MATCHCODE OBJECT", Field);
    const decimals = seqs("DECIMALS", Source);

    const perm = per(type,
                     def,
                     str("OBLIGATORY"),
                     match,
                     cmd,
                     length,
                     decimals,
                     radio,
                     memory,
                     modif,
                     listbox,
                     visible,
                     str("VALUE CHECK"),
                     str("NO-DISPLAY"),
                     str("AS CHECKBOX"),
                     str("LOWER CASE"));

    const ret = seqs(para,
                     FieldSub,
                     opt(new FieldLength()),
                     opt(perm));

    return verNot(Version.Cloud, ret);
  }

}