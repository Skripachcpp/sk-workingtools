export function isEmpty(value) {
  return !hasValue(value);
}

export function hasValue(value) {
  if (value === null) return false;
  if (value === undefined) return false;
  if (value === '') return false;

  if (value === 0) return true;
  if (value) return true;

  return false;
}

export function notEmptyString(str) {
  return (typeof str === 'string' || str instanceof String) && str.length > 0;
}

export function concat(seporate, items) {
  if (!items) return '';

  let value = '';

  let any = false;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!hasValue(item)) continue;

    if (!any) {
      value += item;
      any = true;
    }
    else {
      value += seporate + item;
    }

    any = true;
  }

  return value;
}


export function concatTitle(title, value, ending) {
  if (hasValue(value)) {
    if (ending) {
      return concatEnding(title + value, ending);
    } else {
      return title + value;
    }
  }


  return '';
}

export function concatEnding(value, ending, where) {
  if (hasValue(value)) {
    if (where) {
      if (where(value)) {
        return value + ending;
      } else {
        return value;
      }
    } else {
      return value + ending;
    }
  }

  return '';
}

export function concatWithSeparator(stringArray, separator) {
  let result = '';

  if (Array.isArray(stringArray) && stringArray.length > 0){
    stringArray.forEach(function (item) {
      if (item){
        result += (result.length > 0 ? separator : '') + item;
      }
    });
  }

  return result;
}

export function uniqueName(name, names) {
  if (!hasValue(name)) return null;
  if (!hasValue(names)) return name;

  let objectKeys = {};
  names.forEach(a => {objectKeys[a] = true});

  let index = 0;
  let nextName = name;
  while (objectKeys[nextName]) {
    index++;
    nextName = name + " " + index;
  }

  return nextName;
}

export function toString(v) {
  if (!hasValue(v)) return null;
  if (typeof v === 'object') return JSON.stringify(v);
  return v.toString();
}