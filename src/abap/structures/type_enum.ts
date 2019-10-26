import * as Statements from "../statements";
import * as Expressions from "../expressions";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, alt, beginEnd} from "./_combi";
import {StructureNode} from "../nodes";
import {Scope} from "../syntax/_scope";
import {UnknownType} from "../types/basic";
import {TypedIdentifier} from "../types/_typed_identifier";

export class TypeEnum extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.TypeEnumBegin),
                    star(alt(sta(Statements.TypeEnum), sta(Statements.Type))),
                    sta(Statements.TypeEnumEnd));
  }

  public runSyntax(node: StructureNode, _scope: Scope, filename: string): TypedIdentifier[] {
    if (!(node.get() instanceof TypeEnum)) {
      throw new Error("addEnumValues unexpected type");
    }
    const ret: TypedIdentifier[] = [];
    for (const type of node.findDirectStatements(Statements.Type)) {
      const expr = type.findFirstExpression(Expressions.NamespaceSimpleName);
      if (expr === undefined) {
        continue;
      }
      const token = expr.getFirstToken();
      ret.push(new TypedIdentifier(token, filename, new UnknownType("todo, type_enum")));
    }
    return ret;
  }

}