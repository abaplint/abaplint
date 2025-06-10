import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import * as Structures from "../../3_structures/structures";
import {StatementNode, StructureNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import * as Basic from "../../types/basic";
import {IStructureComponent} from "../../types/basic";
import {Data as DataSyntax} from "../statements/data";
import {ReferenceType} from "../_reference";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Data {
  public runSyntax(node: StructureNode, input: SyntaxInput): TypedIdentifier | undefined {
    const name = node.findFirstExpression(Expressions.DefinitionName)!.getFirstToken();
    let table: boolean = false;
    const values: {[index: string]: string} = {};

    const components: IStructureComponent[] = [];
    for (const c of node.getChildren()) {
      const ctyp = c.get();
      if (c instanceof StatementNode && ctyp instanceof Statements.Data) {
        const found = new DataSyntax().runSyntax(c, input);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
          if (found.getValue() !== undefined) {
            values[found.getName()] = found.getValue() as string;
          }
        }
      } else if (c instanceof StructureNode && ctyp instanceof Structures.Data) {
        const found = new Data().runSyntax(c, input);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      } else if (c instanceof StatementNode && ctyp instanceof Statements.DataBegin) {
        if (c.findDirectTokenByText("OCCURS")) {
          table = true;
        }
      } else if (c instanceof StatementNode && ctyp instanceof Statements.IncludeType) {
        // INCLUDES
        const typeToken = c.findFirstExpression(Expressions.TypeName)?.getFirstToken();
        const typeName = typeToken?.getStr();

        let foundId = input.scope.findType(typeName);
        if (foundId === undefined) {
          foundId = input.scope.findVariable(typeName);
        }

        let found = foundId?.getType();
        if (found === undefined) {
          const f = input.scope.getDDIC().lookupTableOrView(typeName).type;
          if (f instanceof TypedIdentifier) {
            found = f.getType();
          } else {
            found = f;
          }
        } else {
          input.scope.addReference(typeToken, foundId, ReferenceType.TypeReference, input.filename);
        }
        if (found instanceof Basic.VoidType) {
          if (table === true) {
            const ttyp = new Basic.TableType(found, {withHeader: true, keyType: Basic.TableKeyType.default});
            return new TypedIdentifier(name, input.filename, ttyp);
          } else {
            return new TypedIdentifier(name, input.filename, found);
          }
        }
        if (found instanceof Basic.UnknownType) {
          return new TypedIdentifier(name, input.filename, new Basic.UnknownType("unknown type, " + typeName));
        }
        if (found instanceof Basic.TableType && found.isWithHeader()) {
          found = found.getRowType();
        }
        if (!(found instanceof Basic.StructureType)) {
          const message = "not structured, " + typeName;
          input.issues.push(syntaxIssue(input, typeToken!, message));
          return new TypedIdentifier(name, input.filename, Basic.VoidType.get(CheckSyntaxKey));
        }
        for (const c of found.getComponents()) {
          components.push(c);
        }
      }
    }

    if (table === true) {
      return new TypedIdentifier(name, input.filename, new Basic.TableType(
        new Basic.StructureType(components), {withHeader: true, keyType: Basic.TableKeyType.default}));
    } else {
      const val = Object.keys(values).length > 0 ? values : undefined;
      return new TypedIdentifier(name, input.filename, new Basic.StructureType(components), undefined, val);
    }
  }
}