import {ExpressionNode, StatementNode, TokenNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import * as Basic from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Table} from "../../../objects";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {DatabaseTableSource} from "./database_table";

type Bounds = {min: number, max: number, align: number};

// byte length of a flat type in a unicode system, as a lower and an upper bound:
// IntegerType also stands for INT1 and INT2, and padding is left out of the lower bound
function bounds(type: AbstractType): Bounds | undefined {
  if (type instanceof Basic.CharacterType || type instanceof Basic.NumericType) {
    return {min: type.getLength() * 2, max: type.getLength() * 2, align: 2};
  } else if (type instanceof Basic.DateType) {
    return {min: 16, max: 16, align: 2};
  } else if (type instanceof Basic.TimeType) {
    return {min: 12, max: 12, align: 2};
  } else if (type instanceof Basic.IntegerType) {
    return {min: 1, max: 4, align: 4};
  } else if (type instanceof Basic.Integer8Type || type instanceof Basic.FloatType
      || type instanceof Basic.DecFloat16Type || type instanceof Basic.UTCLongType) {
    return {min: 8, max: 8, align: 8};
  } else if (type instanceof Basic.DecFloat34Type) {
    return {min: 16, max: 16, align: 16};
  } else if (type instanceof Basic.PackedType || type instanceof Basic.HexType) {
    return {min: type.getLength(), max: type.getLength(), align: 1};
  } else if (type instanceof Basic.StructureType) {
    let min = 0;
    let max = 0;
    let align = 1;
    for (const component of type.getComponents()) {
      const sub = bounds(component.type);
      if (sub === undefined) {
        return undefined;
      }
      align = Math.max(align, sub.align);
      max = Math.ceil(max / sub.align) * sub.align + sub.max;
      min = min + sub.min;
    }
    max = Math.ceil(max / align) * align;
    return {min, max, align};
  }
  // deep, generic, void or unknown
  return undefined;
}

// INSERT/MODIFY/UPDATE dbtab FROM wa: the work area must be at least as long as the table line,
// client field included, else the statement is a syntax error on the system
export function checkDatabaseWorkArea(
  node: StatementNode,
  dbSource: DatabaseTableSource,
  sourceTypes: Map<ExpressionNode, AbstractType | undefined>,
  input: SyntaxInput,
): void {
  if (!(dbSource instanceof Table)) {
    return;
  }

  const children = node.getChildren();
  let workArea: ExpressionNode | undefined = undefined;
  for (let i = 0; i < children.length - 1; i++) {
    const child = children[i];
    if (child instanceof TokenNode && child.concatTokens().toUpperCase() === "FROM") {
      const next = children[i + 1];
      if (next instanceof ExpressionNode && next.get() instanceof Expressions.SQLSource) {
        workArea = next;
      }
      break;
    }
  }
  if (workArea === undefined) {
    return;
  }

  const source = workArea.findFirstExpression(Expressions.SimpleSource3) ?? workArea.findFirstExpression(Expressions.Source);
  if (source === undefined) {
    return;
  }
  const waType = sourceTypes.get(source);
  if (!(waType instanceof Basic.StructureType)) {
    return;
  }

  const tableType = dbSource.parseType(input.scope.getRegistry());
  const waBounds = bounds(waType);
  const tableBounds = bounds(tableType);
  if (waBounds === undefined || tableBounds === undefined) {
    return;
  }

  if (waBounds.max < tableBounds.min) {
    const message = "The work area \"" + source.concatTokens() + "\" is not long enough for table " + dbSource.getName();
    input.issues.push(syntaxIssue(input, source.getFirstToken(), message));
  }
}
