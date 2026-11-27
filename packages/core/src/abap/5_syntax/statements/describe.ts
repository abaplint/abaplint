import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {InlineData} from "../expressions/inline_data";
import {CharacterType, DataReference, IntegerType, ObjectReferenceType, StringType, StructureType, TableType, UnknownType, VoidType} from "../../types/basic";
import {TableAccessType} from "../../types/basic/table_type";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Target} from "../expressions/target";
import {Source} from "../expressions/source";
import {FieldChain} from "../expressions/field_chain";
import {ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {TypeUtils} from "../_type_utils";
import {ObjectOriented} from "../_object_oriented";
import {IdentifierMeta} from "../../types/_typed_identifier";
import {ClassAttribute} from "../../types/class_attribute";

export class Describe implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }
    for (const s of node.findDirectExpressions(Expressions.FieldChain)) {
      FieldChain.runSyntax(s, input, ReferenceType.DataReadReference);
    }

    const children = node.getChildren();
    for (const target of node.findDirectExpressions(Expressions.Target)) {
      const keyword = children[children.indexOf(target) - 1]?.concatTokens().toUpperCase();
      const inline = target.findDirectExpression(Expressions.InlineData);
      if (inline === undefined) {
        const issuesBefore = input.issues.length;
        const type = Target.runSyntax(target, input);
        if (keyword === "INTO" && node.findDirectTokenByText("FIELD") && input.issues.length === issuesBefore) {
          this.checkFieldTarget(target, type, input);
        }
        continue;
      }
      if (keyword === "INTO" && node.findDirectTokenByText("FIELD")) {
        const message = "Inline declaration is not possible in DESCRIBE FIELD INTO";
        input.issues.push(syntaxIssue(input, inline.getFirstToken(), message));
        continue;
      }
      let type: AbstractType | undefined;
      if (keyword === "TYPE" || keyword === "KIND") {
        type = new CharacterType(1);
      } else if (keyword === "ID" || keyword === "MASK") {
        type = StringType.get();
      } else if (["LINES", "PAGES", "OCCURS", "COMPONENTS", "LENGTH", "DECIMALS", "LINE", "SIZE", "COUNT", "INTO"].includes(keyword)) {
        type = IntegerType.get();
      }
      InlineData.runSyntax(inline, input, type);
    }

  }

  private checkFieldTarget(target: ExpressionNode, type: AbstractType | undefined, input: SyntaxInput): void {
    if (target.findDirectExpression(Expressions.TableExpression)) {
      input.issues.push(syntaxIssue(input, target.getFirstToken(), "Table expressions are not permitted in DESCRIBE FIELD INTO"));
      return;
    } else if (type === undefined || type instanceof VoidType || type instanceof UnknownType || type.isGeneric()) {
      return;
    }

    const offset = target.findDirectExpression(Expressions.FieldOffset);
    const length = target.findDirectExpression(Expressions.FieldLength);
    const partial = (offset !== undefined && !this.zeroOffset(offset, input))
      || (length !== undefined && !["(*)", "()"].includes(length.concatTokens()));
    const expected = input.scope.findTypePoolType("SYDES_DESC")?.getType()
      ?? input.scope.getDDIC().lookupNoVoid("SYDES_DESC")?.type;
    if (!(type instanceof StructureType) || partial
        || (expected instanceof StructureType && !this.sameLayout(expected, type, input))) {
      input.issues.push(syntaxIssue(input, target.getFirstToken(), "DESCRIBE FIELD INTO target must have type SYDES_DESC"));
    }
  }

  private zeroOffset(offset: ExpressionNode, input: SyntaxInput): boolean {
    const chain = offset.findDirectExpression(Expressions.SimpleFieldChain2);
    if (chain === undefined) {
      return /^\+0*$/.test(offset.concatTokens());
    }
    const children = chain.getChildren();
    let constant = input.scope.findVariable(children[0].concatTokens());
    let type = constant?.getType();
    let value = constant?.getValue();
    let hasValue = true;
    for (const child of children.slice(1)) {
      if (child.get() instanceof Expressions.AttributeName) {
        const name = type instanceof ObjectReferenceType ? type.getIdentifierName() : children[0].concatTokens();
        const definition = input.scope.findObjectDefinition(name);
        const helper = new ObjectOriented(input.scope);
        constant = definition ? helper.searchConstantName(definition, child.concatTokens())
          ?? helper.searchAttributeName(definition, child.concatTokens()) : undefined;
        type = constant?.getType();
        value = constant?.getValue();
        hasValue = true;
      } else if (child.get() instanceof Expressions.ComponentName) {
        const name = child.concatTokens().toUpperCase();
        type = type instanceof StructureType ? type.getComponentByName(name) : undefined;
        const entry = typeof value === "object" ? Object.entries(value).find(([key]) => key.toUpperCase() === name) : undefined;
        value = entry?.[1];
        hasValue = entry !== undefined;
      }
    }
    if (constant === undefined || constant instanceof ClassAttribute || !hasValue
        || !constant.getMeta().includes(IdentifierMeta.ReadOnly)
        || (!constant.getMeta().includes(IdentifierMeta.Static)
          && !(constant.getMeta().includes(IdentifierMeta.BuiltIn) && value !== undefined))) {
      return false;
    }
    if (value === undefined) {
      return type !== undefined && !(type instanceof StructureType
        || type instanceof TableType || type instanceof ObjectReferenceType || type instanceof DataReference);
    }
    return typeof value === "string" && (value === "``" || /^[+-]?0+$/.test(value.replace(/^['`]|['`]$/g, "")));
  }

  private sameLayout(expected: AbstractType, actual: AbstractType, input: SyntaxInput): boolean {
    if (expected instanceof VoidType || expected instanceof UnknownType
        || actual instanceof VoidType || actual instanceof UnknownType || actual.isGeneric()) {
      return true;
    } else if (expected instanceof StructureType && actual instanceof StructureType) {
      const left = expected.getComponents().filter(c => c.asInclude !== true);
      const right = actual.getComponents().filter(c => c.asInclude !== true);
      return left.length === right.length && left.every((c, i) => this.sameLayout(c.type, right[i].type, input));
    } else if (expected instanceof TableType && actual instanceof TableType) {
      // SYDES uses OCCURS 0, which has no explicit primaryKey in the type model.
      return !actual.isWithHeader()
        && expected.getOptions().keyType === actual.getOptions().keyType
        && (expected.getAccessType() ?? TableAccessType.standard) === (actual.getAccessType() ?? TableAccessType.standard)
        && (actual.getOptions().secondary?.length ?? 0) === 0
        && this.sameLayout(expected.getRowType(), actual.getRowType(), input);
    }
    return expected.constructor === actual.constructor && new TypeUtils(input.scope).isAssignableStrict(expected, actual);
  }
}
