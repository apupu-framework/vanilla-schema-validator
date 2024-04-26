params: body
'use strict';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import fs from "fs/promises";
import path from "path";
import { schema, trace_validator, typecast, SCHEMA_VALIDATOR_SOURCE, SCHEMA_VALIDATOR_NAME } from 'vanilla-schema-validator';
import { rip_comments, rip_directives } from  'comment-ripper' ;
import child_process from 'node:child_process';

function inspect(s) {
  return JSON.stringify( s, (k,v)=>typeof v === 'function' ? v.toString() : v, 2 );
}





<%=body%>

export {
  build,
  build_doc,
};
