import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import {UnknownType} from "../../types/basic/unknown_type";
import {INode} from "../../nodes/_inode";
import {Dash, InstanceArrow} from "../../1_lexer/tokens";
import {StructureType, ObjectReferenceType, VoidType, DataReference, TableType, XStringType, StringType} from "../../types/basic";
import {ComponentName} from "./component_name";
import {AttributeName} from "./attribute_name";
import {FieldOffset} from "./field_offset";
import {ReferenceType} from "../_reference";
import {TableExpression} from "./table_expression";
import {Dereference} from "../../2_statements/expressions";
import {FieldLength} from "./field_length";
import {Cast} from "./cast";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Target {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput): AbstractType | undefined {

    const concat = node.concatTokens();
    if (concat.includes("-")) {
      // workaround for names with dashes
      const found = input.scope.findVariable(concat);
      if (found) {
        input.scope.addReference(node.getFirstToken(), found, ReferenceType.DataWriteReference, input.filename);
        return found.getType();
      }
    }

    const children = node.getChildren();
    const first = children[0];
    if (first === undefined || !(first instanceof ExpressionNode)) {
      return undefined;
    }

    let context = this.findTop(first, input);
    if (context === undefined) {
      const message = `"${first.getFirstToken().getStr()}" not found, Target`;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return VoidType.get(CheckSyntaxKey);
    }

    let currentIndex = 1;
    while (currentIndex <= children.length) {
      const current = children[currentIndex];
      if (current === undefined) {
        break;
      }
      currentIndex++;

      if (current.get() instanceof Dash) {
        if (context instanceof UnknownType) {
          const message = "Not a structure, type unknown, target";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        } else if (!(context instanceof StructureType)
            && !(context instanceof TableType && context.isWithHeader() && context.getRowType() instanceof StructureType)
            && !(context instanceof TableType && context.isWithHeader() && context.getRowType() instanceof VoidType)
            && !(context instanceof VoidType)) {
          const message = "Not a structure, target";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        }
      } else if (current.get() instanceof InstanceArrow) {
        if (!(context instanceof ObjectReferenceType)
            && !(context instanceof DataReference)
            && !(context instanceof VoidType)) {
          const message = "Not an object reference, target";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        }
      } else if (current.get() instanceof Dereference) {
        if (!(context instanceof DataReference) && !(context instanceof VoidType)) {
          const message = "Not an object reference, target";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        }

        if (!(context instanceof VoidType)) {
          context = context.getType();
        }
      } else if (current.get() instanceof Expressions.ComponentName) {
        context = ComponentName.runSyntax(context, current, input);
      } else if (current.get() instanceof Expressions.TableBody) {
        if (!(context instanceof TableType)
            && !(context instanceof VoidType)
            && !(context instanceof UnknownType)
            && !(context instanceof UnknownType)) {
          const message = "Not a internal table, \"[]\"";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        }
        if (context instanceof TableType && context.isWithHeader()) {
          context = new TableType(context.getRowType(), {...context.getOptions(), withHeader: false});
        }
      } else if (current instanceof ExpressionNode
          && current.get() instanceof Expressions.TableExpression) {
        if (!(context instanceof TableType) && !(context instanceof VoidType)) {
          const message = "Table expression, expected table";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        }
        TableExpression.runSyntax(current, input);
        if (!(context instanceof VoidType)) {
          context = context.getRowType();
        }
      } else if (current.get() instanceof Expressions.AttributeName) {
        const type = children.length === 0 ? ReferenceType.DataWriteReference : ReferenceType.DataReadReference;
        context = AttributeName.runSyntax(context, current, input, type);
      }
    }

    const offset = node.findDirectExpression(Expressions.FieldOffset);
    if (offset) {
      if (context instanceof XStringType || context instanceof StringType) {
        const message = "xstring/string offset/length in writer position not possible";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return VoidType.get(CheckSyntaxKey);
      }
      FieldOffset.runSyntax(offset, input);
    }

    const length = node.findDirectExpression(Expressions.FieldLength);
    if (length) {
      if (context instanceof XStringType || context instanceof StringType) {
        const message = "xstring/string offset/length in writer position not possible";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return VoidType.get(CheckSyntaxKey);
      }
      FieldLength.runSyntax(length, input);
    }

    return context;
  }

/////////////////////////////////

  private static findTop(node: INode | undefined, input: SyntaxInput): AbstractType | undefined {
    if (node === undefined) {
      return undefined;
    }

    const token = node.getFirstToken();
    const name = token.getStr();

    if (node.get() instanceof Expressions.TargetField
        || node.get() instanceof Expressions.TargetFieldSymbol) {
      const found = input.scope.findVariable(name);
      if (found) {
        input.scope.addReference(token, found, ReferenceType.DataWriteReference, input.filename);
      }
      if (name.includes("~")) {
        const idef = input.scope.findInterfaceDefinition(name.split("~")[0]);
        if (idef) {
          input.scope.addReference(token, idef, ReferenceType.ObjectOrientedReference, input.filename);
        }
      }
      return found?.getType();
    } else if (node.get() instanceof Expressions.ClassName) {
      const found = input.scope.findObjectDefinition(name);
      if (found) {
        input.scope.addReference(token, found, ReferenceType.ObjectOrientedReference, input.filename);
        return new ObjectReferenceType(found);
      } else if (input.scope.getDDIC().inErrorNamespace(name) === false) {
        input.scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, input.filename, {ooName: name, ooType: "CLAS"});
        return VoidType.get(name);
      } else {
        return new UnknownType(name + " unknown, Target");
      }
    } else if (node.get() instanceof Expressions.Cast && node instanceof ExpressionNode) {
      const ret = Cast.runSyntax(node, input, undefined);
      if (ret instanceof UnknownType) {
        const message = "CAST, uknown type";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return VoidType.get(CheckSyntaxKey);
      }
      return ret;
    }

    return new UnknownType("unknown target type");
  }
}