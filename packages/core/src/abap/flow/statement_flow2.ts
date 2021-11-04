import {StructureNode, StatementNode} from "../nodes";
import * as Structures from "../3_structures/structures";
import * as Statements from "../2_statements/statements";
import {FlowGraph} from "./flow_graph";

function findBody(f: StructureNode): readonly (StatementNode | StructureNode)[] {
  return f.findDirectStructure(Structures.Body)?.getChildren() || [];
}

function buildName(statement: StatementNode): string {
  // note: there might be multiple statements on the same line
  return statement.get().constructor.name +
    ":" + statement.getFirstToken().getRow() +
    "," + statement.getFirstToken().getCol();
}

export class StatementFlow2 {
  private counter = 0;

  public build(stru: StructureNode): FlowGraph[] {
    this.counter = 1;
    const ret: FlowGraph[] = [];
    const forms = stru.findAllStructures(Structures.Form);
    for (const f of forms) {
//      const formName = f.findFirstExpression(Expressions.FormName)?.concatTokens();
      ret.push(this.traverseBody(findBody(f)));
    }
    const methods = stru.findAllStructures(Structures.Method);
    for (const f of methods) {
//      const methodName = f.findFirstExpression(Expressions.MethodName)?.concatTokens();
      ret.push(this.traverseBody(findBody(f)));
    }
    return ret;
  }

  private traverseBody(children: readonly (StatementNode | StructureNode)[]): FlowGraph {
    const graph = new FlowGraph(this.counter++);
    if (children.length === 0) {
      return graph;
    }

    let current = graph.getStart();

    for (const c of children) {
//      console.dir(c);
      if (c.get() instanceof Structures.Normal) {
        const firstChild = c.getFirstChild(); // "Normal" only has one child
        if (firstChild instanceof StatementNode) {
//          flows.forEach(f => f.statements.push(firstChild));
//          current.push(firstChild);
          const name = buildName(firstChild);
          graph.addEdge(current, name);
          current = name;
//          console.dir("push: " + name);
          if (firstChild.get() instanceof Statements.Check
              || firstChild.get() instanceof Statements.Assert) {
// todo
          } else if (firstChild.get() instanceof Statements.Exit) {
            break;
          } else if (firstChild.get() instanceof Statements.Return) {
            break;
          }
        } else if(firstChild instanceof StructureNode) {
//          console.dir("firstch: " + firstChild.get().constructor.name);
          const sub = this.traverseStructure(firstChild);
          current = graph.addGraph(current, sub);
//          console.dir("found: " + dump(found));
/*
          const n: StatementFlowPath[] = [];
          for (const existing of flows) {
            for (const fo of found) {
              const add = {statements: [...existing.statements, ...fo.statements]};
              n.push(add);
            }
          }
          */
//          console.dir(dump(n));
        }
      }
    }

    graph.addEdge(current, graph.getEnd());
    return graph;
  }

  private traverseStructure(n: StructureNode | undefined): FlowGraph {
    const graph = new FlowGraph(this.counter++);
    if (n === undefined) {
      return graph;
    }

    const current = graph.getStart();

    const type = n.get();
    if (type instanceof Structures.If) {
      const ifName = buildName(n.findDirectStatement(Statements.If)!);
      const sub = this.traverseBody(findBody(n));

      graph.addEdge(current, ifName);
      graph.addGraph(ifName, sub);
      graph.addEdge(sub.getEnd(), graph.getEnd());
      graph.addEdge(ifName, graph.getEnd());
    } else {
      console.dir("todo, " + n.get().constructor.name);
    }

    return graph;
  }

}