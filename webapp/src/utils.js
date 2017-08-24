import Papa from 'papaparse/papaparse.min';

function isFloat(val) {
  let floatRegex = /^-?\d+(?:[.,]\d*?)?$/;
  if (!floatRegex.test(val)) return false;
  val = parseFloat(val);
  if (isNaN(val)) return false;
  return true;
}

function isNormalInteger(str) {
  let n = Math.floor(Number(str));
  return String(n) === str && n >= 0;
}

// TODO - break out into smaller functions
export function parseEntries(entries) {
  entries = entries.replace(/\t/g, ',');

  let failure = false;
  let failureMessage = null;
  let parsedEntries = null;

  if (entries === '') {
    failure = true;
  } else {
    parsedEntries = Papa.parse(entries, {
      header: false,
      delimiter: ',',
    });

    if (parsedEntries.data.length < 1) {
      failure = true;
    }

    for (let line of parsedEntries.data) {
      if (!line[0]) {
        failure = true;
        failureMessage = 'Error: Empty line';
        break;
      } else {
        if (line[0].includes(' ')) {
          line[0] = line[0].split(' ')[1];
        }

        try {
          let asDate = new Date(line[0]);
          if (asDate.getFullYear() < 2015 || asDate.getFullYear() > 2025) {
            failureMessage = 'Warning: At least one of your dates is before 2015 or after 2025';
            break;
          }
        } catch (o) {
          failure = true;
          failureMessage = `Error: Issue ${line[1]} with date ${line[0]} is not a valid date`;
          break;
        }
      }

      if (!line[2]) {
        failure = true;
        failureMessage = 'Error: Partially empty line';
        break;
      } else {
        if (line[2].includes(' ')) {
          let foundH = false;
          let foundM = false;

          for (let timeDesignation of line[2].split(' ')) {
            let lastChar = timeDesignation.substr(-1);
            if (lastChar === 'h' || lastChar === 'm') {
              if (timeDesignation.includes('h')) {
                if (foundH) {
                  failure = true;
                  failureMessage = 'Error: You have multiple hour designators for an issue';
                  break;
                } else {
                  foundH = true;
                }
              }
              if (timeDesignation.includes('m')) {
                failure = !!foundM;
                if (failure) {
                  failureMessage = 'Error: You have multiple minute designators for an issue';
                  break;
                }
              }
            } else {
              failure = true;
              failureMessage = `Error: Issue ${line[1]} with time designation ${timeDesignation} is not a valid amount of time`;
              break;
            }
          }
        } else {
          try {
            if (isNormalInteger(line[2]) || isFloat(line[2])) {
              line[2] += 'h';
            }
          } catch (Exc) {
            failure = true;
            failureMessage = `Error: Issue ${line[1]} with time ${line[2]} is not a valid amount of time`;
          }
        }
        line[4] = parsedEntries.data.indexOf(line) + 1;
      }
    }
    for (let k = 0; k < parsedEntries.data.length; k++) {
      if (parsedEntries.data[k].length > 4) {
        for (let i = 0; i < parsedEntries.data[k].length; i++) {
          if (i > 3) {
            parsedEntries.data[k][3] = parsedEntries.data[k][3] + ',' + parsedEntries.data[k][i];
          }
        }
      }
    }
  }

  return { failure, failureMessage, parsedEntries: parsedEntries };
}
