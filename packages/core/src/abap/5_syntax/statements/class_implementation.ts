import {StatementNode} from "../../nodes";
import {ObjectOriented} from "../_object_oriented";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import {Identifier} from "../../1_lexer/tokens";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {Position} from "../../../position";
import {BuiltIn} from "../_builtin";
import {ScopeType} from "../_scope_type";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class ClassImplementation implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const helper = new ObjectOriented(input.scope);

    const className = helper.findClassName(node);
    input.scope.push(ScopeType.ClassImplementation, className, node.getFirstToken().getStart(), input.filename);

    const classDefinition = input.scope.findClassDefinition(className);
    if (classDefinition === undefined) {
      throw new Error("Class definition for \"" + className + "\" not found");
    }

    for (const t of classDefinition.getTypeDefinitions().getAll()) {
      input.scope.addType(t.type);
    }

    const sup = input.scope.findClassDefinition(classDefinition.getSuperClass());
    if (sup) {
      input.scope.addIdentifier(new TypedIdentifier(new Identifier(new Position(1, 1), "super"), BuiltIn.filename, new ObjectReferenceType(sup)));
    } else {
      // todo: instead of the void type, do proper typing, ie. only empty constructor method
      input.scope.addIdentifier(new TypedIdentifier(new Identifier(new Position(1, 1), "super"), BuiltIn.filename, new VoidType("noSuper")));
    }
    input.scope.addIdentifier(new TypedIdentifier(new Identifier(new Position(1, 1), "me"), BuiltIn.filename, new ObjectReferenceType(classDefinition)));
    helper.addAliasedAttributes(classDefinition); // todo, this is not correct, take care of instance vs static

    const classAttributes = classDefinition.getAttributes();
    input.scope.addList(classAttributes.getConstants());
    input.scope.addList(classAttributes.getStatic());
    for (const i of classAttributes.getInstance()) {
      input.scope.addExtraLikeType(i);
    }

    helper.fromSuperClassesAndInterfaces(classDefinition);
  }
}