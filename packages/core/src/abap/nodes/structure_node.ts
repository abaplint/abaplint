import {AbstractNode} from "./_abstract_node";
import {Token} from "../1_lexer/tokens/_token";
import {IStatement} from "../2_statements/statements/_statement";
import {IStructure} from "../3_structures/structures/_structure";
import {IStatementRunnable} from "../2_statements/statement_runnable";
import {StatementNode} from "./statement_node";
import {ExpressionNode} from "./expression_node";

export class StructureNode extends AbstractNode<StructureNode | StatementNode> {
  private readonly structure: IStructure;

  public constructor(structure: IStructure) {
    super();
    this.structure = structure;
  }

  public get() {
    return this.structure;
  }

  // todo, remove this method, the logic should never go up in the tree
  public findParent(node: StatementNode): StructureNode | undefined {
    for (const child of this.getChildren()) {
      if (child === node) {
        return this;
      } else if (child instanceof StatementNode) {
        continue;
      } else {
        const res = child.findParent(node);
        if (res) {
          return res;
        }
      }
    }
    return undefined;
  }

  public findDirectStatements(type: new () => IStatement): StatementNode[] {
    const ret: StatementNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof StatementNode && child.get() instanceof type) {
        ret.push(child);
      }
    }
    return ret;
  }

  public findDirectStructures(type: new () => IStructure): StructureNode[] {
    const ret: StructureNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof StructureNode && child.get() instanceof type) {
        ret.push(child);
      }
    }
    return ret;
  }

  public findFirstStatement(type: new () => IStatement): StatementNode | undefined {
    for (const child of this.getChildren()) {
      if (child.get() instanceof type) {
        return child as StatementNode;
      } else if (child instanceof StatementNode) {
        continue;
      } else {
        const res = child.findFirstStatement(type);
        if (res) {
          return res;
        }
      }
    }
    return undefined;
  }

  public findFirstExpression(type: new () => IStatementRunnable): ExpressionNode | undefined {
    for (const child of this.getChildren()) {
      const res = child.findFirstExpression(type);
      if (res) {
        return res;
      }
    }
    return undefined;
  }

  public getFirstToken(): Token {
    const child = this.getFirstChild();

    if (child !== undefined) {
      return child.getFirstToken();
    }

    throw new Error("StructureNode, getFirstToken, unexpected type");
  }

  public getLastToken(): Token {
    const child = this.getLastChild();

    if (child !== undefined) {
      return child.getLastToken();
    }

    throw new Error("StructureNode, getLastToken, unexpected type");
  }

  public findAllExpressions(type: new () => IStatementRunnable): ExpressionNode[] {
    let ret: ExpressionNode[] = [];
    for (const child of this.getChildren()) {
      ret = ret.concat(child.findAllExpressions(type));
    }
    return ret;
  }

  public findAllStatements(type: new () => IStatement): StatementNode[] {
    let ret: StatementNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof StructureNode) {
        ret = ret.concat(child.findAllStatements(type));
      } else if (child.get() instanceof type) {
        ret.push(child);
      }
    }
    return ret;
  }

  public findAllStatementNodes(): StatementNode[] {
    let ret: StatementNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof StatementNode) {
        ret.push(child);
      } else {
        ret = ret.concat(child.findAllStatementNodes());
      }
    }
    return ret;
  }

  public findAllStructures(type: new () => IStructure): StructureNode[] {
    let ret: StructureNode[] = [];
    if (this.get() instanceof type) {
      return [this];
    }
    for (const child of this.getChildren()) {
      if (child instanceof StatementNode) {
        continue;
      } else if (child.get() instanceof type) {
        ret.push(child);
      } else {
        ret = ret.concat(child.findAllStructures(type));
      }
    }
    return ret;
  }

  public findDirectStructure(type: new () => IStructure): StructureNode | undefined {
    if (this.get() instanceof type) {
      return this;
    }
    for (const child of this.getChildren()) {
      if (child.get() instanceof type) {
        return child as StructureNode;
      }
    }
    return undefined;
  }

  public findFirstStructure(type: new () => IStructure): StructureNode | undefined {
    if (this.get() instanceof type) {
      return this;
    }
    for (const child of this.getChildren()) {
      if (child instanceof StatementNode) {
        continue;
      } else if (child.get() instanceof type) {
        return child;
      } else {
        const res = child.findFirstStructure(type);
        if (res) {
          return res;
        }
      }
    }
    return undefined;
  }

}