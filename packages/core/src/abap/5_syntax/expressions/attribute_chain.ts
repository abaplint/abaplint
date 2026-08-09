import {ExpressionNode} from "../../nodes";
import {INode} from "../../nodes/_inode";
import * as Expressions from "../../2_statements/expressions";
import {AbstractType} from "../../types/basic/_abstract_type";
import {VoidType} from "../../types/basic/void_type";
import {CharacterType, DataReference, HexType, ObjectReferenceType, StructureType, TableType, UnknownType} from "../../types/basic";
import {ObjectOriented} from "../_object_oriented";
import {ReferenceType} from "../_reference";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {AttributeName} from "../../2_statements/expressions";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";
import {ComponentName} from "./component_name";
import {AttributeName as AttributeNameSyntax} from "./attribute_name";
import {TableExpression} from "./table_expression";
import {FieldOffset} from "./field_offset";
import {FieldLength} from "./field_length";

export class AttributeChain {
  public static runSyntax(
    inputContext: AbstractType | undefined,
    node: INode,
    input: SyntaxInput,
    type: ReferenceType[]): AbstractType | undefined {

    if (inputContext instanceof VoidType) {
      return inputContext;
    } else if (!(inputContext instanceof ObjectReferenceType)) {
      input.issues.push(syntaxIssue(input, node.getFirstToken(), "Not an object reference(AttributeChain)"));
      return VoidType.get(CheckSyntaxKey);
    }

    const first = node.getChildren()[0];
    if (!(first.get() instanceof AttributeName)) {
      input.issues.push(syntaxIssue(input, node.getFirstToken(), "AttributeChain, unexpected first child"));
      return VoidType.get(CheckSyntaxKey);
    }

    const def = input.scope.findObjectDefinition(inputContext.getIdentifierName());
    if (def === undefined) {
      const message = "Definition for \"" + inputContext.getIdentifierName() + "\" not found in scope(AttributeChain)";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return VoidType.get(CheckSyntaxKey);
    }
    const nameToken = first.getFirstToken();
    const name = nameToken.getStr();
    const helper = new ObjectOriented(input.scope);

    let context: TypedIdentifier | undefined = helper.searchAttributeName(def, name);
    if (context === undefined) {
      context = helper.searchConstantName(def, name);
    }
    if (context === undefined) {
      const message = "Attribute or constant \"" + name + "\" not found in \"" + def.getName() + "\"";
      input.issues.push(syntaxIssue(input, nameToken, message));
      return VoidType.get(CheckSyntaxKey);
    }
    for (const t of type) {
      input.scope.addReference(nameToken, context, t, input.filename);
    }

    let contextType: AbstractType | undefined = context.getType();
    const children = node.getChildren();
    for (let i = 1; i < children.length; i++) {
      const child = children[i];

      if (contextType instanceof VoidType || contextType instanceof UnknownType) {
        return contextType;
      } else if (child.get() instanceof Expressions.ArrowOrDash) {
        const operator = child.getFirstToken().getStr();
        if (operator === "-" && !(contextType instanceof StructureType)) {
          input.issues.push(syntaxIssue(input, child.getFirstToken(), "AttributeChain, not a structure"));
          return VoidType.get(CheckSyntaxKey);
        } else if ((operator === "->" || operator === "=>")
            && !(contextType instanceof ObjectReferenceType)
            && !(contextType instanceof DataReference)) {
          input.issues.push(syntaxIssue(input, child.getFirstToken(), "AttributeChain, not a reference"));
          return VoidType.get(CheckSyntaxKey);
        }
      } else if (child.get() instanceof Expressions.ComponentName) {
        if (contextType instanceof ObjectReferenceType || contextType instanceof DataReference) {
          contextType = AttributeNameSyntax.runSyntax(contextType, child, input, type);
        } else {
          contextType = ComponentName.runSyntax(contextType, child, input);
        }
      } else if (child.getFirstToken().getStr() === "*" && contextType instanceof DataReference) {
        contextType = contextType.getType();
      } else if (child instanceof ExpressionNode && child.get() instanceof Expressions.TableExpression) {
        if (!(contextType instanceof TableType)) {
          input.issues.push(syntaxIssue(input, child.getFirstToken(), "Table expression, expected table"));
          return VoidType.get(CheckSyntaxKey);
        }
        TableExpression.runSyntax(child, input, contextType);
        contextType = contextType.getRowType();
      } else if (child instanceof ExpressionNode && child.get() instanceof Expressions.FieldOffset) {
        const offset = FieldOffset.runSyntax(child, input);
        if (offset !== undefined) {
          if (contextType instanceof CharacterType) {
            contextType = new CharacterType(contextType.getLength() - offset);
          } else if (contextType instanceof HexType) {
            contextType = new HexType(contextType.getLength() - offset);
          }
        }
      } else if (child instanceof ExpressionNode && child.get() instanceof Expressions.FieldLength) {
        const length = FieldLength.runSyntax(child, input);
        if (length !== undefined) {
          if (contextType instanceof CharacterType) {
            contextType = new CharacterType(length);
          } else if (contextType instanceof HexType) {
            contextType = new HexType(length);
          }
        }
      }
    }

    return contextType;
  }

}
