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
    const ret: FlowGraph[] = [];
    const forms = stru.findAllStructures(Structures.Form);
    for (const f of forms) {
//      const formName = f.findFirstExpression(Expressions.FormName)?.concatTokens();
      this.counter = 1;
      ret.push(this.traverseBody(findBody(f), "end#1"));
    }
    const methods = stru.findAllStructures(Structures.Method);
    for (const f of methods) {
//      const methodName = f.findFirstExpression(Expressions.MethodName)?.concatTokens();
      this.counter = 1;
      ret.push(this.traverseBody(findBody(f), "end#1"));
    }
    return ret.map(f => f.reduce());
  }

  private traverseBody(children: readonly (StatementNode | StructureNode)[], procedureEnd: string): FlowGraph {
    const graph = new FlowGraph(this.counter++);
    if (children.length === 0) {
      graph.addEdge(graph.getStart(), graph.getEnd());
      return graph;
    }

    let current = graph.getStart();

    for (const c of children) {
      if (c.get() instanceof Structures.Normal) {
        const firstChild = c.getFirstChild(); // "Normal" only has one child
        if (firstChild instanceof StatementNode) {
          const name = buildName(firstChild);
          graph.addEdge(current, name);
          current = name;
          if (firstChild.get() instanceof Statements.Check
              || firstChild.get() instanceof Statements.Assert) {
            graph.addEdge(name, procedureEnd);
          } else if (firstChild.get() instanceof Statements.Exit) {
            graph.addEdge(name, procedureEnd);
            return graph;
          } else if (firstChild.get() instanceof Statements.Return) {
            graph.addEdge(name, procedureEnd);
            return graph;
          }
        } else if(firstChild instanceof StructureNode) {
          const sub = this.traverseStructure(firstChild, procedureEnd);
          current = graph.addGraph(current, sub);
        }
      }
    }

    graph.addEdge(current, graph.getEnd());
    return graph;
  }

  private traverseStructure(n: StructureNode | undefined, procedureEnd: string): FlowGraph {
    const graph = new FlowGraph(this.counter++);
    if (n === undefined) {
      return graph;
    }

    let current = graph.getStart();

    const type = n.get();
    if (type instanceof Structures.If) {
      const ifName = buildName(n.findDirectStatement(Statements.If)!);
      const sub = this.traverseBody(findBody(n), procedureEnd);
      graph.addEdge(current, ifName);
      graph.addGraph(ifName, sub);
      graph.addEdge(sub.getEnd(), graph.getEnd());
      current = ifName;

      for (const e of n.findDirectStructures(Structures.ElseIf)) {
        const elseifst = e.findDirectStatement(Statements.ElseIf);
        if (elseifst === undefined) {
          continue;
        }

        const elseIfName = buildName(elseifst);
        const sub = this.traverseBody(findBody(e), procedureEnd);
        graph.addEdge(current, elseIfName);
        graph.addGraph(elseIfName, sub);
        graph.addEdge(sub.getEnd(), graph.getEnd());
        current = elseIfName;
      }

      const els = n.findDirectStructure(Structures.Else);
      const elsest = els?.findDirectStatement(Statements.Else);
      if (els && elsest) {
        const elseName = buildName(elsest);
        const sub = this.traverseBody(findBody(els), procedureEnd);
        graph.addEdge(current, elseName);
        graph.addGraph(elseName, sub);
        graph.addEdge(sub.getEnd(), graph.getEnd());
      } else {
        graph.addEdge(ifName, graph.getEnd());
      }
    } else if (type instanceof Structures.Loop
      || type instanceof Structures.While
      || type instanceof Structures.With
      || type instanceof Structures.Provide
      || type instanceof Structures.Select
      || type instanceof Structures.Do) {
      const loopName = buildName(n.getFirstStatement()!);
      const sub = this.traverseBody(findBody(n), procedureEnd);

      graph.addEdge(current, loopName);
      graph.addGraph(loopName, sub);
      graph.addEdge(sub.getEnd(), loopName);
      graph.addEdge(loopName, graph.getEnd());
    } else if (type instanceof Structures.Try) {
      const tryName = buildName(n.getFirstStatement()!);

      const body = this.traverseBody(findBody(n), procedureEnd);
      graph.addEdge(current, tryName);
      graph.addGraph(tryName, body);
      graph.addEdge(body.getEnd(), graph.getEnd());

      for (const c of n.findDirectStructures(Structures.Catch)) {
        const catchName = buildName(c.getFirstStatement()!);
        const catchBody = this.traverseBody(findBody(c), procedureEnd);
// TODO: this does not take exceptions into account
        graph.addEdge(body.getEnd(), catchName);
        graph.addGraph(catchName, catchBody);
        graph.addEdge(catchBody.getEnd(), graph.getEnd());
      }
// TODO, handle CLEANUP
    } else if (type instanceof Structures.Case) {
      const caseName = buildName(n.getFirstStatement()!);
      graph.addEdge(current, caseName);
      let othersFound = false;
      for (const w of n.findDirectStructures(Structures.When)) {
        const first = w.getFirstStatement();
        if (first === undefined) {
          continue;
        }
        if (first.get() instanceof Statements.WhenOthers) {
          othersFound = true;
        }
        const firstName = buildName(first);

        const sub = this.traverseBody(findBody(w), procedureEnd);
        graph.addEdge(caseName, firstName);
        graph.addGraph(firstName, sub);
        graph.addEdge(sub.getEnd(), graph.getEnd());
      }
      if (othersFound === false) {
        graph.addEdge(caseName, graph.getEnd());
      }
    } else if (type instanceof Structures.CaseType) {
      const caseName = buildName(n.getFirstStatement()!);
      graph.addEdge(current, caseName);
      let othersFound = false;
      for (const w of n.findDirectStructures(Structures.WhenType)) {
        const first = w.getFirstStatement();
        if (first === undefined) {
          continue;
        }
        if (first.get() instanceof Statements.WhenOthers) {
          othersFound = true;
        }
        const firstName = buildName(first);

        const sub = this.traverseBody(findBody(w), procedureEnd);
        graph.addEdge(caseName, firstName);
        graph.addGraph(firstName, sub);
        graph.addEdge(sub.getEnd(), graph.getEnd());
      }
      if (othersFound === false) {
        graph.addEdge(caseName, graph.getEnd());
      }
    } else {
      console.dir("todo, " + n.get().constructor.name);
    }

    return graph;
  }

}