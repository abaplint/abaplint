import {ForbiddenKernelWrite, ForbiddenKernelWriteConf} from "../../src/rules";
import {testRule} from "./_utils";

const tests1 = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE '@KERNEL console.log(1);'.", cnt: 0},
];

testRule(tests1, ForbiddenKernelWrite);

const tests2 = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE 'hello'.", cnt: 0},
  {abap: "WRITE '@KERNELX'.", cnt: 0},
  {abap: "WRITE `@KERNEL console.log(1);`.", cnt: 0},
  {abap: "WRITE '@KERNEL console.log(1);'.", cnt: 1},
  {abap: "WRITE '@KERNEL console.log(1);'.\nWRITE '@KERNEL console.log(2);'.", cnt: 2},
  {abap: "IF 1 = 1.\n  WRITE '@KERNEL console.log(1);'.\nENDIF.", cnt: 1},
];

const none = new ForbiddenKernelWriteConf();
none.allow = [];
testRule(tests2, ForbiddenKernelWrite, none, "forbidden_kernel_write, allow none");

const tests3 = [
  {abap: "WRITE '@KERNEL console.log(1);'.", cnt: 0},
];

const zfoo = new ForbiddenKernelWriteConf();
zfoo.allow = ["^zf"];
testRule(tests3, ForbiddenKernelWrite, zfoo, "forbidden_kernel_write, allow by name, case insensitive");

const tests4 = [
  {abap: "WRITE '@KERNEL console.log(1);'.", cnt: 1},
];

const other = new ForbiddenKernelWriteConf();
other.allow = ["^CL_", "^KERNEL_"];
testRule(tests4, ForbiddenKernelWrite, other, "forbidden_kernel_write, other objects allowed");
