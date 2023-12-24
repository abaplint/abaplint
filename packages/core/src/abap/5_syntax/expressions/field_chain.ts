import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
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

export class FieldChain {

  public runSyntax(
    node: ExpressionNode,
    scope: CurrentScope,
    filename: string,
    refType?: ReferenceType | ReferenceType[] | undefined): AbstractType | undefined {

    const children = node.getChildren().slice();
    let contextName = children[0].concatTokens();

    let context: AbstractType | undefined = undefined;
    try {
      context = this.findTop(children.shift(), scope, filename, refType);
    } catch (error) {
      const concat = node.concatTokens();
      if (concat.includes("-") && node.getFirstChild()?.get() instanceof Expressions.SourceField) {
        // workaround for names with dashes, eg. "sy-repid"
        const offset = node.findDirectExpression(Expressions.FieldOffset)?.concatTokens() || "";
        const length = node.findDirectExpression(Expressions.FieldLength)?.concatTokens() || "";
        const found = scope.findVariable(concat.replace(offset, "").replace(length, ""));
        if (found) {
          if (refType) {
            scope.addReference(node.getFirstToken(), found, refType, filename);
          }
          // this is not completely correct, but will work, dashes in names is a mess anyhow
          return found.getType();
        }
      }
      throw error;
    }

    while (children.length > 0) {
      contextName += children[0].concatTokens();
      const current = children.shift();
      if (current === undefined) {
        break;
      }

      if (current.get() instanceof DashW) {
        throw new Error("Ending with dash");
      } else if (current.get() instanceof Dash) {
        if (context instanceof UnknownType) {
          throw new Error("Not a structure, type unknown, FieldChain");
        } else if (!(context instanceof StructureType)
            && !(context instanceof TableType && context.isWithHeader())
            && !(context instanceof VoidType)) {
          if (context instanceof TableType && context.isWithHeader() === false) {
            if (scope.isAllowHeaderUse(contextName.substring(0, contextName.length - 1))) {
              // FOR ALL ENTRIES workaround
              context = context.getRowType();
              if (!(context instanceof StructureType) && !(context instanceof VoidType)) {
                context = new StructureType([{name: "TABLE_LINE", type: context}]);
              }
            } else {
              throw new Error("Table without header, cannot access fields, " + contextName);
            }
          } else {
            throw new Error("Not a structure, FieldChain");
          }
        }
      } else if (current.get() instanceof InstanceArrow) {
        if (!(context instanceof ObjectReferenceType)
            && !(context instanceof DataReference)
            && !(context instanceof VoidType)) {
          throw new Error("Not an object reference, field chain");
        }
      } else if (current.get() instanceof DereferenceExpression) {
        context = new Dereference().runSyntax(context);
      } else if (current.get() instanceof Expressions.ComponentName) {
        if (context instanceof TableType && context.isWithHeader()) {
          context = context.getRowType();
        }
        try {
          context = new ComponentName().runSyntax(context, current);
        } catch (error) {
          const concat = node.concatTokens();
          if (concat.includes("-")) {
            // workaround for names with dashes, eg. "sy-repid"
            const offset = node.findDirectExpression(Expressions.FieldOffset)?.concatTokens() || "";
            const length = node.findDirectExpression(Expressions.FieldLength)?.concatTokens() || "";
            const found = scope.findVariable(concat.replace(offset, "").replace(length, ""));
            if (found) {
              if (refType) {
                scope.addReference(node.getFirstToken(), found, refType, filename);
              }
              context = found.getType();
            } else {
              throw error;
            }
          } else {
            throw error;
          }
        }

      } else if (current instanceof ExpressionNode
          && current.get() instanceof Expressions.TableExpression) {
        if (!(context instanceof TableType) && !(context instanceof VoidType)) {
          throw new Error("Table expression, expected table");
        }
        new TableExpression().runSyntax(current, scope, filename);
        if (!(context instanceof VoidType)) {
          context = context.getRowType();
        }
      } else if (current.get() instanceof Expressions.AttributeName) {
        context = new AttributeName().runSyntax(context, current, scope, filename, refType);
      } else if (current.get() instanceof Expressions.FieldOffset && current instanceof ExpressionNode) {
        const offset = new FieldOffset().runSyntax(current, scope, filename);
        if (offset) {
          if (context instanceof CharacterType) {
            context = new CharacterType(context.getLength() - offset);
          } else if (context instanceof HexType) {
            context = new HexType(context.getLength() - offset);
          }
        }
      } else if (current.get() instanceof Expressions.FieldLength && current instanceof ExpressionNode) {
        const length = new FieldLength().runSyntax(current, scope, filename);
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

  private findTop(
    node: INode | undefined,
    scope: CurrentScope,
    filename: string,
    type: ReferenceType | ReferenceType[] | undefined): AbstractType | undefined {

    if (node === undefined) {
      return undefined;
    }

    if (node instanceof ExpressionNode
        && node.get() instanceof Expressions.SourceFieldSymbol) {
      return new SourceFieldSymbol().runSyntax(node, scope, filename);
    } else if (node instanceof ExpressionNode
        && node.get() instanceof Expressions.SourceField) {
      return new SourceField().runSyntax(node, scope, filename, type);
    } else if (node.get() instanceof Expressions.ClassName) {
      const classTok = node.getFirstToken();
      const classNam = classTok.getStr();
      if (classNam.toUpperCase() === "OBJECT") {
        return new GenericObjectReferenceType();
      }
      const found = scope.existsObject(classNam);
      if (found.found === true && found.id) {
        scope.addReference(classTok, found.id, ReferenceType.ObjectOrientedReference, filename);
        return new ObjectReferenceType(found.id);
      } else if (scope.getDDIC().inErrorNamespace(classNam) === false) {
        scope.addReference(classTok, undefined,
                           ReferenceType.ObjectOrientedVoidReference, filename, {ooName: classNam.toUpperCase()});
        return new VoidType(classNam);
      } else {
        throw new Error("Unknown class " + classNam);
      }
    }

    return undefined;
  }

}