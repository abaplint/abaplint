import {IStatement} from "./_statement";
import {verNot, str, seqs, opts, altPrios, pers, regex as reg} from "../combi";
import {Source, Constant, FieldChain, Dynamic, Field, FieldLength, FieldSub, RadioGroupName, Modif, TypeName, SimpleSource} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Parameter implements IStatement {

  public getMatcher(): IStatementRunnable {
    const para = altPrios("PARAMETER", "PARAMETERS");
    const def = seqs("DEFAULT", altPrios(Constant, FieldChain));
    const radio = seqs("RADIOBUTTON GROUP", RadioGroupName);
    const type = seqs(altPrios("TYPE", "LIKE"), altPrios(TypeName, Dynamic));
    const memory = seqs("MEMORY ID", SimpleSource);
    const listbox = str("AS LISTBOX");
    const cmd = seqs("USER-COMMAND", reg(/^\w+$/));
    const modif = seqs("MODIF ID", Modif);
    const visible = seqs("VISIBLE LENGTH", Constant);
    const length = seqs("LENGTH", Constant);
    const match = seqs("MATCHCODE OBJECT", Field);
    const decimals = seqs("DECIMALS", Source);

    const perm = pers(type,
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
                      "VALUE CHECK",
                      "NO-DISPLAY",
                      "AS CHECKBOX",
                      "LOWER CASE");

    const ret = seqs(para,
                     FieldSub,
                     opts(FieldLength),
                     opts(perm));

    return verNot(Version.Cloud, ret);
  }

}