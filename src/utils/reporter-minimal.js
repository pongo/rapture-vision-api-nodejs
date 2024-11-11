/* c8 ignore start */
/* node:coverage disable */

// https://github.com/barelyhuman/node-reporter-minimal

// @ts-nocheck

import { relative } from "node:path";
import { inherits } from "node:util";

class Bail {
  constructor() {
    this.name = this.constructor.name;
  }
}

inherits(Bail, Error);

const cross = "x";
const check = "√";

const color = (code, end) => (str) => `\x1B[${code}m${str}\x1B[${end}m`;
const bold = color(1, 22);
const dim = color(2, 22);
const gray = (str) => `\x1b[38;5;8m${str}\x1b[0m`; // color(90, 0);
const red = color(31, 39);
const green = color(32, 39);
const pad = (count) => "  ".repeat(count);
const header = (test, duration, passed) =>
  (!passed ? red(`${cross} `) : green(`${check} `)) +
  test +
  (duration ? gray(` [${duration}ms]`) : "") +
  "\n";

const cleanTermLink = (link) => link.replace(process.cwd(), "").replace(/^\//, "");
const groupBy = (x, f) => x.reduce((a, b, i) => ((a[f(b, i, x)] ||= []).push(b), a), {});

const printEvents = (baseTestEvent, depth = baseTestEvent.depth || 0) => {
  const children = baseTestEvent.children || [];
  const hasErrors = children.find((d) => d.hasError);
  let output = "";
  output +=
    pad(depth) + header(baseTestEvent.name, baseTestEvent.diagnostics?.duration_ms, !hasErrors);

  children.forEach((childTestEvents) => {
    if (!childTestEvents.hasError) return;

    if (childTestEvents.children) {
      output += printEvents(childTestEvents, depth + childTestEvents.depth + 1);
    } else {
      output +=
        pad(depth + childTestEvents.depth + 1) +
        red("x ") +
        childTestEvents.name +
        "\n" +
        // pad(depth + childTestEvents.depth + 1) +
        dim(cleanTermLink(childTestEvents.termLink)) +
        "\n" +
        red(
          // pad(depth + childTestEvents.depth + 1) +
          new Error(childTestEvents.error).message
            .replace(/(\n)/g, "\n " /* + pad(depth + childTestEvents.depth + 1) */)
            .toString() + "\n",
        );
    }
  });
  return output;
};

// runner
const run = {
  tree: [],
  create: (event) => {
    const hasError = event.type == "test:fail";
    return {
      name: event.data.name,
      depth: event.data.nesting,
      diagnostics: event.data.details,
      file: event.data.file,
      termLink: `${event.data.file}:${event.data.line}:${event.data.column}`,
      hasError,
      startOfFile: event.data.line === 1 && event.data.column === 1,
      error: hasError ? event.data.details.error : null,
    };
  },
  add: (event, completion) => {
    if (event.startOfFile) return;
    const existingEventInd = run.tree.findIndex((d) => d.termLink === event.termLink);

    if (existingEventInd > -1) {
      if (completion) {
        Object.assign(run.tree[existingEventInd], event);
        return;
      }
    }
    if (event.depth === 0) {
      run.tree.push(event);
      return;
    }

    const parentNode = run.tree
      .slice()
      .reverse()
      .find((d) => d.file === event.file && d.depth === event.depth - 1);

    if (!parentNode) {
      return;
    }

    event.parent = parentNode;
    (parentNode.children ||= []).push(event);

    run.tree.push(event);
  },
  end: () => {
    if (!run.tree.length) return;

    const cwd = process.cwd();
    const hasError = run.tree.some((d) => d.hasError);

    if (hasError) return printFlat();

    // return printFlat();
    return printGroupedByFiles(true);

    function printGroupedByFiles(onlyFiles) {
      let output = "\n";

      const grouped = groupBy(
        run.tree.filter((d) => d.depth == 0).filter((d) => (hasError ? d.hasError : true)),
        (x) => x.file,
      );

      for (const [file, tests] of Object.entries(grouped)) {
        if (onlyFiles) {
          const duration = tests.reduce((a, b) => a + (b.diagnostics?.duration_ms ?? 0), 0);
          output +=
            green(`${check} `) +
            `${relative(cwd, file)}` +
            (duration ? gray(` [${duration.toFixed(2)}ms]`) : "") +
            "\n";
        } else {
          output += dim("\n> ") + bold(`${relative(cwd, file)}\n`);
          tests.forEach((rootTest) => {
            output += printEvents(rootTest);
          });
        }
      }

      return output;
    }

    function printFlat() {
      let output = "\n";
      run.tree
        .filter((d) => d.depth == 0)
        .forEach((rootTest) => {
          output += printEvents(rootTest);
        });
      return output;
    }
  },
};

export default async function* minimalReporter(source) {
  let skip = false;
  let end = false;
  for await (const event of source) {
    switch (event.type) {
      case "test:start":
        run.add(run.create(event));
        break;

      case "test:pass":
        // case "test:fail":
        if (!skip) run.add(run.create(event), true);
        else {
          if (!end) {
            end = true;
            yield run.end();
          }
          throw new Bail();
        }
        break;

      case "test:fail":
        run.add(run.create(event), true);
        skip = true;
        break;

      case "test:stderr":
        // case "test:stdout":
        yield `${event.data.message}`;
        break;

      default:
        break;
    }
  }

  if (!end) yield run.end();
  // yield run.end();
}
