import {seq, optPrio, alt, altPrio, Expression, opt, ver, AlsoIn} from "../combi";
import {Default, EntityAssociation, FieldChain, TypeName, TypeNameOrInfer, TypeStructure} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";
import {derivedTypesAlt} from "./_derived_types";

export class TypeParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const table = seq(altPrio("STANDARD", "HASHED", "INDEX", "SORTED", "ANY"),
                      "TABLE");

    const foo = seq(optPrio(seq(table, "OF")), optPrio("REF TO"));

    const typeLine = "LINE OF";

    const ret = seq(alt(foo, typeLine),
                    TypeNameOrInfer,
                    opt(Default));

    const like = seq("LIKE", opt("LINE OF"), FieldChain, optPrio(Default));

    const entity = alt(TypeName, EntityAssociation);
    const rapTable = ver(Release.v770,
                         seq("TYPE", "TABLE FOR", derivedTypesAlt(
                           ver(Release.v773, seq("ACTION IMPORT", entity), {also: AlsoIn.OpenABAP}),
                           ver(Release.v774, seq("READ LINK", entity), {also: AlsoIn.OpenABAP}),
                           ver(Release.v787, seq("EVENT", entity), {also: AlsoIn.OpenABAP}),
                         ), optPrio("VALUE IS INITIAL")),
                         {also: AlsoIn.OpenABAP});

    // Method parameters also allow the RAP table and response type forms.
    return altPrio(rapTable, TypeStructure, seq("TYPE", alt(table, ret)), like);
  }
}
