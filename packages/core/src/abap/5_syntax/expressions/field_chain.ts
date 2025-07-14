import {ExpressionNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import {INode} from "../../nodes/_inode";
import * as Expressions from "../../2_statements/expressions";
import {Dash, DashW, InstanceArrow} from "../../1_lexer/tokens";
import {StructureType, ObjectReferenceType, VoidType, DataReference, TableType, UnknownType, GenericObjectReferenceType, CharacterType, HexType} from "../../types/basic";
import {ComponentName} from "./component_name";
import {AttributeName} from "./attribute_name";
import {ReferenceType} from "../_reference";
import {FieldOffset} from "./field_offset";
import {FieldLength} from "./field_length";
import {TableExpression} from "./table_expression";
import {Dereference as DereferenceExpression} from "../../2_statements/expressions";
import {Dereference} from "./dereference";
import {SourceFieldSymbol} from "./source_field_symbol";
import {SourceField} from "./source_field";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";
import {Version} from "../../../version";

export class FieldChain {

  public static runSyntax(
    node: ExpressionNode,
    input: SyntaxInput,
    refType?: ReferenceType | ReferenceType[] | undefined): AbstractType | undefined {

    if (node.getFirstChild()?.get() instanceof Expressions.SourceField
        && node.findDirectExpression(Expressions.ComponentName)) {
      // workaround for names with dashes, eg. "sy-repid"
      const concat = node.concatTokens();
      const offset = node.findDirectExpression(Expressions.FieldOffset)?.concatTokens() || "";
      const length = node.findDirectExpression(Expressions.FieldLength)?.concatTokens() || "";
      const found = input.scope.findVariable(concat.replace(offset, "").replace(length, ""));
      if (found) {
        if (refType) {
          input.scope.addReference(node.getFirstToken(), found, refType, input.filename);
        }
        // this is not completely correct, but will work, dashes in names is a mess anyhow
        return found.getType();
      }
    }

    let context: AbstractType | undefined = undefined;
    const children = node.getChildren();
    context = this.findTop(children[0], input, refType);

    for (let i = 1; i < children.length; i++) {
      const current = children[i];
      if (current === undefined) {
        break;
      }

      if (current.get() instanceof DashW) {
        const message = "Ending with dash";
        input.issues.push(syntaxIssue(input, current.getFirstToken(), message));
        return VoidType.get(CheckSyntaxKey);
      } else if (current.get() instanceof Dash) {
        if (context instanceof UnknownType) {
          const message = "Not a structure, type unknown, FieldChain";
          input.issues.push(syntaxIssue(input, current.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        } else if (!(context instanceof StructureType)
            && !(context instanceof TableType && context.isWithHeader())
            && !(context instanceof VoidType)) {
          if (context instanceof TableType && context.isWithHeader() === false) {
            let contextName = "";
            for (let j = 0; j < i; j++) {
              contextName += children[j].concatTokens();
            }
            if (input.scope.isAllowHeaderUse(contextName)) {
              // FOR ALL ENTRIES workaround
              context = context.getRowType();
              if (!(context instanceof StructureType) && !(context instanceof VoidType)) {
                context = new StructureType([{name: "TABLE_LINE", type: context}]);
              }
            } else {
              const message = "Table without header, cannot access fields, " + contextName;
              input.issues.push(syntaxIssue(input, current.getFirstToken(), message));
              return VoidType.get(CheckSyntaxKey);
            }
          } else {
            const message = "Not a structure, FieldChain";
            input.issues.push(syntaxIssue(input, current.getFirstToken(), message));
            return VoidType.get(CheckSyntaxKey);
          }
        }
      } else if (current.get() instanceof InstanceArrow) {
        if (!(context instanceof ObjectReferenceType)
            && !(context instanceof DataReference)
            && !(context instanceof VoidType)) {
          const message = "Not an object reference, field chain";
          input.issues.push(syntaxIssue(input, current.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        }
      } else if (current.get() instanceof DereferenceExpression) {
        context = Dereference.runSyntax(current, context, input);
        if (context?.isGeneric() === true && input.scope.getVersion() < Version.v756 && input.scope.getVersion() !== Version.Cloud) {
          throw new Error("A generic reference cannot be dereferenced");
        }
      } else if (current.get() instanceof Expressions.ComponentName) {
        if (context instanceof TableType && context.isWithHeader()) {
          context = context.getRowType();
        }
        context = ComponentName.runSyntax(context, current, input);
      } else if (current instanceof ExpressionNode
          && current.get() instanceof Expressions.TableExpression) {
        if (!(context instanceof TableType) && !(context instanceof VoidType)) {
          const message = "Table expression, expected table";
          input.issues.push(syntaxIssue(input, current.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        }
        TableExpression.runSyntax(current, input);
        if (!(context instanceof VoidType)) {
          context = context.getRowType();
        }
      } else if (current.get() instanceof Expressions.AttributeName) {
        context = AttributeName.runSyntax(context, current, input, refType);
      } else if (current.get() instanceof Expressions.FieldOffset && current instanceof ExpressionNode) {
        const offset = FieldOffset.runSyntax(current, input);
        if (offset) {
          if (context instanceof CharacterType) {
            context = new CharacterType(context.getLength() - offset);
          } else if (context instanceof HexType) {
            context = new HexType(context.getLength() - offset);
          }
        }
      } else if (current.get() instanceof Expressions.FieldLength && current instanceof ExpressionNode) {
        const length = FieldLength.runSyntax(current, input);
        if (length) {
          if (context instanceof CharacterType) {
            context = new CharacterType(length);
          } else if (context instanceof HexType) {
            context = new HexType(length);
          }
        }
      }

    }

    return context;
  }

  ////////////////

  private static findTop(
    node: INode | undefined,
    input: SyntaxInput,
    type: ReferenceType | ReferenceType[] | undefined): AbstractType | undefined {

    if (node === undefined) {
      return undefined;
    }

    if (node instanceof ExpressionNode
        && node.get() instanceof Expressions.SourceFieldSymbol) {
      return SourceFieldSymbol.runSyntax(node, input);
    } else if (node instanceof ExpressionNode
        && node.get() instanceof Expressions.SourceField) {
      return SourceField.runSyntax(node, input, type);
    } else if (node instanceof ExpressionNode
        && node.get() instanceof Expressions.Field) {
      return SourceField.runSyntax(node, input, type);
    } else if (node.get() instanceof Expressions.ClassName) {
      const classTok = node.getFirstToken();
      const classNam = classTok.getStr();
      if (classNam.toUpperCase() === "OBJECT") {
        return new GenericObjectReferenceType();
      }
      const found = input.scope.existsObject(classNam);
      if (found?.id) {
        input.scope.addReference(classTok, found.id, ReferenceType.ObjectOrientedReference, input.filename);
        return new ObjectReferenceType(found.id);
      } else if (input.scope.getDDIC().inErrorNamespace(classNam) === false) {
        input.scope.addReference(classTok, undefined,
                                 ReferenceType.ObjectOrientedVoidReference, input.filename, {ooName: classNam.toUpperCase()});
        return VoidType.get(classNam);
      } else {
        const message = "Unknown class " + classNam;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return VoidType.get(CheckSyntaxKey);
      }
    }

    return undefined;
  }

}