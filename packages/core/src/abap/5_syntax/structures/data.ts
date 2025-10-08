import {SyntaxInput} from "../_syntax_input";
import {Data as DataSyntax} from "../statements/data";
import {IStructureComponent} from "../../types/basic";
import {StatementNode, StructureNode, TokenNode} from "../../nodes";
import {Type} from "../statements/type";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {Types} from "./types";
import * as Basic from "../../types/basic";
import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import * as Structures from "../../3_structures/structures";
import {IncludeType} from "../statements/include_type";
import {Constant} from "../statements/constant";
import {Constants} from "./constants";

export class Data {
  public static runSyntax(node: StructureNode, input: SyntaxInput): TypedIdentifier | undefined {
    const fouth = node.getFirstChild()?.getChildren()[3];
    const isCommonPart = fouth instanceof TokenNode && fouth.concatTokens() === "COMMON";
    if (isCommonPart) {
      this.runCommonPartSyntax(node, input);
      return undefined;
    }

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
        const found = Data.runSyntax(c, input);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      } else if (c instanceof StatementNode && ctyp instanceof Statements.DataBegin) {
        if (c.findDirectTokenByText("OCCURS")) {
          table = true;
        }
      } else if (c instanceof StatementNode && ctyp instanceof Statements.IncludeType) {
        // INCLUDES
        const found = new IncludeType().runSyntax(c, input);
        if (found instanceof Basic.VoidType) {
          if (table === true) {
            const ttyp = new Basic.TableType(found, {withHeader: true, keyType: Basic.TableKeyType.default});
            return new TypedIdentifier(name, input.filename, ttyp);
          } else {
            return new TypedIdentifier(name, input.filename, found);
          }
        } else if (found instanceof Basic.UnknownType) {
          return new TypedIdentifier(name, input.filename, found);
        }

        for (const c of found) {
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

  private static runCommonPartSyntax(node: StructureNode, input: SyntaxInput): void {
    for (const c of node.getChildren()) {
      const ctyp = c.get();
      if (c instanceof StatementNode && ctyp instanceof Statements.Data) {
        const found = new DataSyntax().runSyntax(c, input);
        if (found) {
          input.scope.addIdentifier(found);
        }
      } else if (c instanceof StructureNode && ctyp instanceof Structures.Data) {
        const found = Data.runSyntax(c, input);
        if (found) {
          input.scope.addIdentifier(found);
        }
      } else if (c instanceof StatementNode && ctyp instanceof Statements.Type) {
        const found = new Type().runSyntax(c, input);
        if (found) {
          input.scope.addType(found);
        }
      } else if (c instanceof StructureNode && ctyp instanceof Structures.Types) {
        const found = new Types().runSyntax(c, input);
        if (found) {
          input.scope.addType(found);
        }
      } else if (c instanceof StatementNode && ctyp instanceof Statements.Constant) {
        const found = new Constant().runSyntax(c, input);
        if (found) {
          input.scope.addIdentifier(found);
        }
      } else if (c instanceof StructureNode && ctyp instanceof Structures.Constants) {
        const {type: found, values: _} = new Constants().runSyntax(c, input);
        if (found) {
          input.scope.addIdentifier(found);
        }
      }
    }
  }
}