import {structureType} from "../_utils";
import {Chain} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: `
  chain.
    field sdfs-dsf.
    field sdfs-sdfds.

    module sdfs on chain-request.
  endchain.`},
];

structureType(cases, new Chain());