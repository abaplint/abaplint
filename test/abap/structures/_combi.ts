import {expect} from "chai";
import {opt, sta, star, seq, alt, sub, beginEnd} from "../../../src/abap/structures/_combi";
import * as Statements from "../../../src/abap/statements";
import * as Structures from "../../../src/abap/structures";
import {StructureNode} from "../../../src/abap/node";

describe("structure combi statement", function() {
  let sta1 = sta(Statements.Move);

  it("sta1 match", function() {
    let match = sta1.run([new Statements.Move()], new StructureNode());
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
  });

  it("sta1 not match", function() {
    let match = sta1.run([new Statements.Do()], new StructureNode());
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(true);
  });

  it("sta1 multi", function() {
    let match = sta1.run([new Statements.Move(), new Statements.Move()], new StructureNode());
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(false);
  });

  it("sta1 none", function() {
    let match = sta1.run([], new StructureNode());
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(true);
  });
});

describe("structure combi opt", function() {
  let opt1 = opt(sta(Statements.Move));

  it("opt1 match", function() {
    let match = opt1.run([new Statements.Move()], new StructureNode());
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
  });

  it("opt1 not match", function() {
    let match = opt1.run([new Statements.Do()], new StructureNode());
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(false);
  });

  it("opt1 multi", function() {
    let match = opt1.run([new Statements.Move(), new Statements.Move()], new StructureNode());
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(false);
  });

  it("opt1 none", function() {
    let match = opt1.run([], new StructureNode());
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
  });
});

describe("structure combi star", function() {
  let star1 = star(sta(Statements.Move));

  it("star1 match", function() {
    let match = star1.run([new Statements.Move()], new StructureNode());
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
  });

  it("star1 not match", function() {
    let match = star1.run([new Statements.Do()], new StructureNode());
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(false);
  });

  it("star1 multi1", function() {
    let match = star1.run([new Statements.Move(), new Statements.Move()], new StructureNode());
    expect(match.matched.length).to.equal(2);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
  });

  it("star1 multi2", function() {
    let match = star1.run([new Statements.Move(), new Statements.Move(), new Statements.Do()], new StructureNode());
    expect(match.matched.length).to.equal(2);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(false);
  });

  it("star1 none", function() {
    let match = star1.run([], new StructureNode());
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
  });
});

describe("structure combi seq", function() {
  let seq1 = seq(sta(Statements.Move), sta(Statements.Do));

  it("seq1 match", function() {
    let match = seq1.run([new Statements.Move(), new Statements.Do()], new StructureNode());
    expect(match.matched.length).to.equal(2);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
  });

  it("seq1 not match", function() {
    let match = seq1.run([new Statements.Do()], new StructureNode());
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(true);
  });

  it("seq1 multi2", function() {
    let match = seq1.run([new Statements.Move(), new Statements.Do(), new Statements.Do()], new StructureNode());
    expect(match.matched.length).to.equal(2);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(false);
  });

  it("seq1 none", function() {
    let match = seq1.run([], new StructureNode());
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(true);
  });
});

describe("structure combi alt", function() {
  let alt1 = alt(sta(Statements.Move), sta(Statements.Do));

  it("alt1 match1", function() {
    let match = alt1.run([new Statements.Move()], new StructureNode());
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
  });

  it("alt1 match2", function() {
    let match = alt1.run([new Statements.Do()], new StructureNode());
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
  });

  it("alt1 not match", function() {
    let match = alt1.run([new Statements.Call()], new StructureNode());
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(true);
  });

  it("alt1 multi2", function() {
    let match = alt1.run([new Statements.Move(), new Statements.Do()], new StructureNode());
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(false);
  });

  it("alt1 none", function() {
    let match = alt1.run([], new StructureNode());
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(true);
  });
});

describe("structure combi sub structure", function() {
  let sub1 = sub(new Structures.Normal());

  it("sub1 match", function() {
    let match = sub1.run([new Statements.Move()], new StructureNode());
    expect(match.matched.length).to.equal(1);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
  });

  it("sub1 no match", function() {
    let match = sub1.run([new Statements.ClassDefinition()], new StructureNode());
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(true);
  });
});

describe("structure combi beginEnd", function() {
  let sub1 = beginEnd(sta(Statements.Do), sta(Statements.EndDo), sta(Statements.EndDo));

  it("beginEnd, match", function() {
    let match = sub1.run([new Statements.Do(), new Statements.EndDo(), new Statements.EndDo()], new StructureNode());
    expect(match.matched.length).to.equal(3);
    expect(match.unmatched.length).to.equal(0);
    expect(match.error).to.equal(false);
  });

  it("beginEnd, no match", function() {
    let match = sub1.run([new Statements.ClassDefinition()], new StructureNode());
    expect(match.matched.length).to.equal(0);
    expect(match.unmatched.length).to.equal(1);
    expect(match.error).to.equal(true);
  });
});