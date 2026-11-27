import {expect} from "chai";
import {runMulti, runProgram} from "./syntax";

const message = (type: string) => `Field type "${type}" does not permit substrings to be accessed`;

describe("syntax.ts, offset or length taking a whole numeric field", () => {
  const program = (code: string): string => `
TYPES: BEGIN OF ty_struc,
         i TYPE i,
       END OF ty_struc.
DATA i TYPE i.
DATA i2 TYPE i.
DATA i8 TYPE int8.
DATA p TYPE p LENGTH 5.
DATA f TYPE f.
DATA d16 TYPE decfloat16.
DATA d34 TYPE decfloat34.
DATA s TYPE string.
DATA len TYPE i.
DATA struc TYPE ty_struc.
DATA ref TYPE REF TO i.
${code}`;

  const ok: string[] = [
    `s = i+0.`,
    `s = i+00.`,
    `s = i(*).`,
    `s = i+0(*).`,
    `s = i(4).`,
    `s = i+0(4).`,
    `s = i8(8).`,
    `s = i8+0(8).`,
    `s = f(8).`,
    `s = d16(8).`,
    `s = d34(16).`,
    `s = p+0.`,
    `s = p(*).`,
    `s = p(5).`,
    `s = p+0(5).`,
    `s = struc-i+0(4).`,
    `s = ref->*(4).`,
    `i+0 = 1.`,
    `i(4) = 1.`,
    `f(*) = 1.`,
    `p+0(5) = 1.`,
    `struc-i(*) = 1.`,
    `i2 = i+0(*).`,
  ];

  for (const abap of ok) {
    it("ok: " + abap, () => {
      const issues = runProgram(program(abap));
      expect(issues.map(i => i.getMessage())).to.deep.equal([]);
    });
  }

  const errors: {abap: string, type: string}[] = [
    {abap: `s = i+1.`, type: "I"},
    {abap: `s = i+1(*).`, type: "I"},
    {abap: `s = i+1(4).`, type: "I"},
    {abap: `s = i(0).`, type: "I"},
    {abap: `s = i(2).`, type: "I"},
    {abap: `s = i+0(2).`, type: "I"},
    {abap: `s = i(8).`, type: "I"},
    {abap: `s = i(len).`, type: "I"},
    {abap: `s = i+len.`, type: "I"},
    {abap: `s = i+0(len).`, type: "I"},
    {abap: `s = i8(4).`, type: "8"},
    {abap: `s = f(4).`, type: "F"},
    {abap: `s = d16(16).`, type: "a"},
    {abap: `s = d34(8).`, type: "e"},
    {abap: `s = p(4).`, type: "P"},
    {abap: `s = p+0(4).`, type: "P"},
    {abap: `i+1 = 1.`, type: "I"},
    {abap: `f(4) = 1.`, type: "F"},
  ];

  for (const e of errors) {
    it("error: " + e.abap, () => {
      const issues = runProgram(program(e.abap));
      expect(issues.map(i => i.getMessage())).to.deep.equal([message(e.type)]);
    });
  }

  // dictionary types of the floating point kinds, with the byte length of the field
  const dictionary: {datatype: string, length: string, bytes: number}[] = [
    {datatype: "FLTP", length: "000016", bytes: 8},
    {datatype: "DF16_RAW", length: "000016", bytes: 8},
    {datatype: "DF34_RAW", length: "000034", bytes: 16},
  ];

  for (const d of dictionary) {
    const element = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZELEMENT</ROLLNAME>
    <DATATYPE>${d.datatype}</DATATYPE>
    <LENG>${d.length}</LENG>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const run = (code: string): string[] => runMulti([
      {filename: "zelement.dtel.xml", contents: element},
      {filename: "zfoobar.prog.abap", contents: `DATA val TYPE zelement.\nDATA s TYPE string.\n${code}`},
    ]).map(i => i.getMessage());

    it(`ok: ${d.datatype}, the length in bytes`, () => {
      expect(run(`s = val+0(${d.bytes}).`)).to.deep.equal([]);
    });

    it(`error: ${d.datatype}, half the length in bytes`, () => {
      expect(run(`s = val(${d.bytes / 2}).`)).to.deep.equal([message("F")]);
    });
  }
});
