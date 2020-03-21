import {expect} from "chai";
import {opt, sta, star, seq, alt, sub, beginEnd} from "../../../src/abap/3_structures/structures/_combi";
import * as Statements from "../../../src/abap/2_statements/statements";
import * as Structures from "../../../src/abap/3_structures/structures";
import {StatementNode} from "../../../src/abap/nodes/";
import {IStructure} from "../../../src/abap/3_structures/structures/_structure";
import {IStatement} from "../../../src/abap/2_statements/statements/_statement";
import {AbstractNode} from "../../../src/abap/nodes/_abstract_node";
import {Token} from "../../../src/abap/1_lexer/tokens/_token";

class DummyNode extends AbstractNode {
  public get(): undefined {
    return undefined;
  }
  public getFirstToken(): Token {
    throw new Error("not implemented");
  }
  public getLastToken(): Token {
    throw new Error("not implemented");
  }
}

function toNodes(statements: IStatement[]): StatementNode[] {
  return statements.map((e) => { return new StatementNode(e); });
}

describe("structure combi statement", () => {
  const sta1 = sta(Statements.Move);

  it("sta1 match", () => {
    const parent = new DummyNode();
    const match = sta1.run(toNodes([new Statements.Move()]), parent);
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(1);
    expect(parent.getChildren()[0].get()).to.be.instanceof(Statements.Move);
  });

  it("sta1 not match", () => {
    const parent = new DummyNode();
    const match = sta1.run(toNodes([new Statements.Do()]), parent);
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(true);
  });

  it("sta1 multi", () => {
    const parent = new DummyNode();
    const match = sta1.run(toNodes([new Statements.Move(), new Statements.Move()]), parent);
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(1);
  });

  it("sta1 none", () => {
    const parent = new DummyNode();
    const match = sta1.run([], parent);
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(true);
  });
});

describe("structure combi opt", () => {
  const opt1 = opt(sta(Statements.Move));

  it("opt1 match", () => {
    const parent = new DummyNode();
    const match = opt1.run(toNodes([new Statements.Move()]), parent);
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(1);
  });

  it("opt1 not match", () => {
    const parent = new DummyNode();
    const match = opt1.run(toNodes([new Statements.Do()]), parent);
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(0);
  });

  it("opt1 multi", () => {
    const parent = new DummyNode();
    const match = opt1.run(toNodes([new Statements.Move(), new Statements.Move()]), parent);
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(1);
  });

  it("opt1 none", () => {
    const parent = new DummyNode();
    const match = opt1.run([], parent);
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(0);
  });
});

describe("structure combi star", () => {
  const star1 = star(sta(Statements.Move));

  it("star1 match", () => {
    const parent = new DummyNode();
    const match = star1.run(toNodes([new Statements.Move()]), parent);
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(1);
  });

  it("star1 not match", () => {
    const parent = new DummyNode();
    const match = star1.run(toNodes([new Statements.Do()]), parent);
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(0);
  });

  it("star1 multi1", () => {
    const parent = new DummyNode();
    const match = star1.run(toNodes([new Statements.Move(), new Statements.Move()]), parent);
    expect(match.matched.length).to.equal(2);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(2);
  });

  it("star1 multi2", () => {
    const parent = new DummyNode();
    const match = star1.run(toNodes([new Statements.Move(), new Statements.Move(), new Statements.Do()]), parent);
    expect(match.matched.length).to.equal(2);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(2);
  });

  it("star1 none", () => {
    const parent = new DummyNode();
    const match = star1.run([], parent);
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(0);
  });
});

describe("structure combi seq", () => {
  const seq1 = seq(sta(Statements.Move), sta(Statements.Do));

  it("seq1 match", () => {
    const parent = new DummyNode();
    const match = seq1.run(toNodes([new Statements.Move(), new Statements.Do()]), parent);
    expect(match.matched.length).to.equal(2);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(2);
  });

  it("seq1 not match", () => {
    const parent = new DummyNode();
    const match = seq1.run(toNodes([new Statements.Do()]), parent);
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(true);
    expect(parent.getChildren().length).to.equal(0);
  });

  it("seq1 multi2", () => {
    const parent = new DummyNode();
    const match = seq1.run(toNodes([new Statements.Move(), new Statements.Do(), new Statements.Do()]), parent);
    expect(match.matched.length).to.equal(2);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(2);
  });

  it("seq1 none", () => {
    const parent = new DummyNode();
    const match = seq1.run([], parent);
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(true);
    expect(parent.getChildren().length).to.equal(0);
  });
});

describe("structure combi alt", () => {
  const alt1 = alt(sta(Statements.Move), sta(Statements.Do));

  it("alt1 match1", () => {
    const parent = new DummyNode();
    const match = alt1.run(toNodes([new Statements.Move()]), parent);
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(1);
  });

  it("alt1 match2", () => {
    const parent = new DummyNode();
    const match = alt1.run(toNodes([new Statements.Do()]), parent);
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(1);
  });

  it("alt1 not match", () => {
    const parent = new DummyNode();
    const match = alt1.run(toNodes([new Statements.Call()]), parent);
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(true);
    expect(parent.getChildren().length).to.equal(0);
  });

  it("alt1 multi2", () => {
    const parent = new DummyNode();
    const match = alt1.run(toNodes([new Statements.Move(), new Statements.Do()]), parent);
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(1);
  });

  it("alt1 none", () => {
    const parent = new DummyNode();
    const match = alt1.run([], parent);
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(true);
    expect(parent.getChildren().length).to.equal(0);
  });
});

describe("structure combi sub structure", () => {
  const sub1 = sub(new Structures.Normal());

  it("sub1 match", () => {
    const parent = new DummyNode();
    const match = sub1.run(toNodes([new Statements.Move()]), parent);
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(1);
  });

  it("sub1 no match", () => {
    const parent = new DummyNode();
    const match = sub1.run(toNodes([new Statements.ClassDefinition()]), parent);
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(true);
    expect(parent.getChildren().length).to.equal(0);
  });
});

describe("structure combi beginEnd", () => {
  const sub1 = beginEnd(sta(Statements.Do), sta(Statements.EndDo), sta(Statements.EndDo));

  it("beginEnd, match", () => {
    const parent = new DummyNode();
    const match = sub1.run(toNodes([new Statements.Do(), new Statements.EndDo(), new Statements.EndDo()]), parent);
    expect(match.matched.length).to.equal(3);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
  });

  it("beginEnd, no match", () => {
    const parent = new DummyNode();
    const match = sub1.run(toNodes([new Statements.ClassDefinition()]), parent);
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(true);
  });
});

describe("structure combi, complex1", () => {
  class Normal implements IStructure {
    public getMatcher() {
      return alt(sta(Statements.Move), sta(Statements.Do));
    }
  }
  const sub1 = star(sub(new Normal()));

  it("complex1 match", () => {
    const parent = new DummyNode();
    const match = sub1.run(toNodes([new Statements.Move(), new Statements.Move()]), parent);
    expect(match.matched.length).to.equal(2);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(2);
    expect(parent.getChildren()[0].getChildren().length).to.equal(1);
    expect(parent.getChildren()[1].getChildren().length).to.equal(1);
  });

});

describe("structure combi, complex2", () => {
  const sub1 = star(alt(sta(Statements.Move), sta(Statements.Do)));

  it("complex2 match", () => {
    const parent = new DummyNode();
    const match = sub1.run(toNodes([new Statements.Move(), new Statements.Move()]), parent);
    expect(match.matched.length).to.equal(2);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
    expect(parent.getChildren().length).to.equal(2);
    expect(parent.getChildren()[0].getChildren().length).to.equal(0);
    expect(parent.getChildren()[1].getChildren().length).to.equal(0);
  });

});