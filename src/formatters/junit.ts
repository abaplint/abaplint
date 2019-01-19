import {Issue} from "../issue";
import {IFormatter} from "./_iformatter";
import {js2xml} from 'xml-js';

export class Junit implements IFormatter {

  public output(issues: Issue[], _fileCount: number): string {
    let outputObj = {
      _declaration: {
        _attributes: {
          version: '1.0',
          encoding: 'UTF-8'
        }
      },
      testsuites: {
        testsuite: {
          _attributes: {
            name: 'abaplint',
            tests: issues.length || 1,
            failures: issues.length,
            errors: 0,
            skipped: 0
          },
          testcase: [] as {}[]
        }
      }
    };

    if(issues.length > 0) {
      for (const issue of issues) {
        outputObj.testsuites.testsuite.testcase.push({
          _attributes: {
            classname: issue.getFile().getObjectName(),
            file: issue.getFile().getFilename(),
            name: `${issue.getFile().getFilename()}: [${issue.getStart().getRow()}, ${issue.getStart().getCol()}] - ${issue.getKey()}`
          },
          failure: {
            _attributes: {
              message: issue.getKey(),
            },
            _cdata: `${issue.getMessage()}`
          }
        });
      }
    }
    else {
      outputObj.testsuites.testsuite.testcase.push({
        _attributes: {
          classname: 'none',
          name: 'OK'
        },
      });
    }

    let xml = js2xml(outputObj, { compact: true, spaces: 2 });

    return xml;
  }

}