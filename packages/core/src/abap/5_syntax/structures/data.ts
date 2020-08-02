import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import * as Structures from "../../3_structures/structures";
import {StatementNode, StructureNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import * as Basic from "../../types/basic";
import {IStructureComponent} from "../../types/basic";
import {Data as DataSyntax} from "../statements/data";

export class Data {
  public runSyntax(node: StructureNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const name = node.findFirstExpression(Expressions.NamespaceSimpleName)!.getFirstToken();
    let table: boolean = false;

    const components: IStructureComponent[] = [];
    for (const c of node.getChildren()) {
      const ctyp = c.get();
      if (c instanceof StatementNode && ctyp instanceof Statements.Data) {
        const found = new DataSyntax().runSyntax(c, scope, filename);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      } else if (c instanceof StructureNode && ctyp instanceof Structures.Data) {
        const found = new Data().runSyntax(c, scope, filename);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      } else if (c instanceof StatementNode && ctyp instanceof Statements.DataBegin) {
        if (c.findDirectTokenByText("OCCURS")) {
          table = true;
        }
      } else if (c instanceof StatementNode && ctyp instanceof Statements.IncludeType) {
        // INCLUDES
        const typeName = c.findFirstExpression(Expressions.TypeName)?.getFirstToken().getStr();
        let found = scope.findType(typeName)?.getType();
        if (found === undefined) {
          found = scope.getDDIC().lookupTableOrView(typeName);
        }
        if (found instanceof Basic.VoidType) {
          if (table === true) {
            return new TypedIdentifier(name, filename, new Basic.TableType(found, true));
          } else {
            return new TypedIdentifier(name, filename, found);
          }
        }
        if (found instanceof Basic.UnknownType) {
          return new TypedIdentifier(name, filename, new Basic.UnknownType("unknown type, " + typeName));
        }
        if (!(found instanceof Basic.StructureType)) {
          throw new Error("not structured, " + typeName);
        }
        for (const c of found.getComponents()) {
          components.push(c);
        }
      }
    }

    if (table === true) {
      return new TypedIdentifier(name, filename, new Basic.TableType(new Basic.StructureType(components), true));
    } else {
      return new TypedIdentifier(name, filename, new Basic.StructureType(components));
    }
  }
}