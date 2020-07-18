import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files";
import {MethodLengthStats} from "../../src/utils/method_length_stats";

describe("method length stats", () => {
  const tests = [
    {abap: "foo bar", lengths: []},
    {abap: "ENDMETHOD.", lengths: []},
    {abap: "METHOD foo. ENDMETHOD.", lengths: [0]},
    {abap: "METHOD foo. ENDMETHOD. METHOD bar. ENDMETHOD.", lengths: [0, 0]},
    {abap: "METHOD foo. WRITE moo. ENDMETHOD.", lengths: [1]},
    {abap: "METHOD foo. WRITE moo. WRITE boo. ENDMETHOD.", lengths: [2]},
  ];

  tests.forEach((test) => {
    it(test.abap, async () => {
      const reg = new Registry().addFile(new MemoryFile("zfoo.clas.abap", test.abap));
      await reg.parseAsync();
      const stats = MethodLengthStats.run(reg.getFirstObject()!);
      expect(stats.length).to.equals(test.lengths.length);
      for (let i = 0; i < stats.length; i++) {
        expect(stats[i].count).to.equals(test.lengths[i]);

      }
    });

  });
});