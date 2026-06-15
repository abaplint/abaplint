import * as Statements from "./statements";
import * as Expressions from "./expressions";
import {StatementNode} from "../nodes";
import {TokenNode} from "../nodes";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {ExpressionNode} from "../nodes/expression_node";
import {IStatement} from "./statements/_statement";

type TopChildren = readonly (ExpressionNode | TokenNode)[];

function containsAggregation(children: TopChildren): boolean {
  for (const child of children) {
    if (!(child instanceof ExpressionNode)) {
      continue;
    }
    if (child.get() instanceof Expressions.SQLAggregation) {
      return true;
    }
    if (child.get() instanceof Expressions.SQLSetOpGroup) {
      continue;
    }
    if (containsAggregation(child.getChildren())) {
      return true;
    }
  }
  return false;
}

function isCountAllPattern(children: TopChildren): boolean {
  for (const child of children) {
    if (!(child instanceof ExpressionNode)) { continue; }
    const e = child.get();
    if (e instanceof Expressions.SQLGroupBy ||
        e instanceof Expressions.SQLHaving ||
        e instanceof Expressions.SQLOrderBy) {
      return false;
    }
  }
  return containsAggregation(children);
}

function scanForExprTypes(children: TopChildren, found: Set<Function>, targets: readonly Function[]): void {
  for (const child of children) {
    if (found.size === targets.length) { return; }
    if (!(child instanceof ExpressionNode)) { continue; }
    const e = child.get();
    if (e instanceof Expressions.SQLSetOpGroup) { continue; }
    for (const t of targets) {
      if (e instanceof t) { found.add(t); break; }
    }
    scanForExprTypes(child.getChildren(), found, targets);
  }
}

function isSelectLoop(node: StatementNode): boolean {
  const selectExpr = node.findDirectExpression(Expressions.Select);
  const top = selectExpr ? selectExpr.getChildren() : [];

  if (top.some(c => c instanceof TokenNode && c.get().getStr().toUpperCase() === "SINGLE")) {
    return false;
  }

  const targets = [
    Expressions.SQLSetOp, Expressions.SQLPackageSize, Expressions.SQLIntoTable,
    Expressions.SQLIntoStructure, Expressions.SQLIntoList, Expressions.SQLGroupBy,
  ] as const;
  const found = new Set<Function>();
  scanForExprTypes(top, found, targets);

  const has = (t: Function) => found.has(t);

  if (has(Expressions.SQLPackageSize)) { return true; }
  if (has(Expressions.SQLIntoTable)) { return false; }

  const hasInto = has(Expressions.SQLIntoTable) || has(Expressions.SQLIntoStructure) || has(Expressions.SQLIntoList);
  if (!hasInto && isCountAllPattern(top)) { return false; }
  if (has(Expressions.SQLSetOp)) { return true; }
  if (!has(Expressions.SQLGroupBy) && containsAggregation(top)) { return false; }

  return true;
}

function isWithLoop(node: StatementNode): boolean {
  const selectExpr = node.findDirectExpression(Expressions.Select);
  if (!selectExpr) { return true; }

  const targets = [Expressions.SQLPackageSize, Expressions.SQLIntoTable] as const;
  const found = new Set<Function>();
  scanForExprTypes(selectExpr.getChildren(), found, targets);

  if (found.has(Expressions.SQLPackageSize)) { return true; }
  if (found.has(Expressions.SQLIntoTable)) { return false; }

  return true;
}

export function reclassifySelect(
  node: StatementNode,
  stmt: IStatement,
  pragmas: readonly AbstractToken[],
): StatementNode {
  const children = [...node.getChildren()];
  if (stmt instanceof Statements.Select || stmt instanceof Statements.SelectLoop) {
    const loop = isSelectLoop(node);
    if (loop && stmt instanceof Statements.Select) {
      return new StatementNode(new Statements.SelectLoop(), node.getColon(), pragmas).setChildren(children);
    } else if (!loop && stmt instanceof Statements.SelectLoop) {
      return new StatementNode(new Statements.Select(), node.getColon(), pragmas).setChildren(children);
    }
  } else if (stmt instanceof Statements.With || stmt instanceof Statements.WithLoop) {
    const loop = isWithLoop(node);
    if (loop && stmt instanceof Statements.With) {
      return new StatementNode(new Statements.WithLoop(), node.getColon(), pragmas).setChildren(children);
    } else if (!loop && stmt instanceof Statements.WithLoop) {
      return new StatementNode(new Statements.With(), node.getColon(), pragmas).setChildren(children);
    }
  }
  return node;
}
