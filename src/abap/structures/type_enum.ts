import * as Statements from "../statements";
import * as Expressions from "../expressions";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, alt, beginEnd} from "./_combi";
import {StructureNode} from "../nodes";
import {Scope} from "../syntax/_scope";
import {Identifier} from "../types/_identifier";

export class TypeEnum extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.TypeEnumBegin),
                    star(alt(sta(Statements.TypeEnum), sta(Statements.Type))),
                    sta(Statements.TypeEnumEnd));
  }

  public runSyntax(node: StructureNode, scope: Scope, filename: string): void {
    if (!(node.get() instanceof TypeEnum)) {
      throw new Error("addEnumValues unexpected type");
    }
    for (const type of node.findDirectStatements(Statements.Type)) {
      const expr = type.findFirstExpression(Expressions.NamespaceSimpleName);
      if (expr === undefined) {
        continue;
      }
      const token = expr.getFirstToken();
      scope.addIdentifier(new Identifier(token, filename));
    }
  }

}