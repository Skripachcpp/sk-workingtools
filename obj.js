export function flatTree(v) {
  if (typeof v === 'object' && !Array.isArray(v))
    return v;

  let flt = (array, kv, prntKey, po) => {
    if (!kv) kv = {};
    if (!array || array.length <= 0) return kv;
    array.forEach(a => {
      if (!a) return;

      let key;
      if (hasValue(a.key)) key = a.key;
      else if (hasValue(a.id)) key = a.id;

      let child = a['child'];
      let value = {};
      for (let k in a) if (k !== 'child' && k !== 'key' && k !== 'id' && k !== 'hasChildren')
        value[k] = a[k];

      kv[key] = value;

      value['parent'] = hasValue(prntKey) ? prntKey : value['parent'];
      if (!hasValue(value['parent'])) {
        if (!kv['root']) kv['root'] = [];
        kv['root'].push(key);
      }

      if (po) {
        if (!po['child']) po['child'] = [];
        po['child'].push(key);
      }

      if (child && child.length > 0) {
        flt(child, kv, key, value);
      }
    });

    return kv;
  };

  let obj = flt(v);
  return obj;
}

export function flatDict(v) {
  if (typeof v === 'object' && !Array.isArray(v))
    return v;

  let kv = {};
  let array = v;
  if (!array || array.length <= 0) return kv;
  array.forEach(a => {
    if (!a || a.key === a.parent) return;

    let key;
    if (hasValue(a.key)) key = a.key;
    else if (hasValue(a.id)) key = a.id;

    let value = kv[key] || (kv[key] = {});
    for (let k in a) if (k !== 'child' && k !== 'key' && k !== 'id' && k !== 'hasChildren')
      value[k] = a[k];

    let pk = value['parent'];
    if (!hasValue(pk)) {
      if (!kv['root']) kv['root'] = [];
      kv['root'].push(key);
    } else {
      let po = kv[pk] || (kv[pk] = {});
      if (!po['child']) po['child'] = [];
      po['child'].push(key);
    }
  });

  return kv;
}

export function toObj(array, getKey, getValue) {
  if (!array || array.length <= 0) return {};
  let obj = {};
  for (let i = 0; i < array.length; i++) {
    let item = array[i];
    if (!item) continue;
    let key;
    if (getKey) key = getKey(item);
    else key = item.key;

    if (!key) continue;
    let value;
    if (getValue) value = getValue(item);
    else value = item.value;

    obj[key] = value;
  }

  return obj;
}

export function toArray(obj, map) {
  if (!obj) return [];

  if (Array.isArray(obj)) {
    let array = obj;
    if (!map) return array;
    else return array.map(map);
  }

  if (typeof obj !== 'object') {
    return [obj];
  }

  let keys = Object.keys(obj);
  let array = [];
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let v = obj[key];

    if (map) {
      let item = map(obj);
      if (item) array.push(item);
    } else {
      array.push({key: key, value: v});
    }
  }

  return array;
}


//--//
function objectOrArray(val, ifObject, ifArray) {
  if (!val) return val;

  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      return ifArray(val);
    } else {
      return ifObject(val);
    }
  }

  return val;
}

function toCustomKeys(str, modifier) {
  if (!str) return '';
  if (!modifier) modifier = (b) => b;

  return String(str)
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '')
    .replace(/[^A-Za-z0-9]+/g, '$')
    .replace(/([a-z0-9])([A-Z])/g, (m, a, b) => `${a}$${b}`)
    .toLowerCase()
    .replace(/(\$)(\w)/g, (m, a, b) => modifier(b));
}

export function customKeys(obj, modifier) {
  if (!obj) return null;

  let target = objectOrArray(obj, (o) => {
    const res = {};
    for (const key in o) {
      let val = o[key];

      val = objectOrArray(val,
        (v) => customKeys(v, modifier),
        (v) => v.map(a => customKeys(a, modifier))
      );

      let nextKey = toCustomKeys(key, modifier);

      let old = res[nextKey];
      if (old && typeof old === 'object' && typeof val === 'object') {
        res[nextKey] = {...old, ...val};
      } else {
        res[nextKey] = val;
      }
    }

    return res;
  },
  (o) => {
    let res = o.map(a => customKeys(a, modifier));
    return res;
  });

  return target;
}

export function camelKeys(obj) {
  return customKeys(obj, (b) => hasValue(b) ? b.toUpperCase() : b);
}

export function lowerKeys(obj) {
  return customKeys(obj, (b) => b);
}

export function lowerArray(array)
{
  if (array && array.length > 0){
    for (let i = 0; i < array.length; i++){
      if (typeof (array[i]) === 'string'){
        array[i] = array[i].toLowerCase();
      }
    }
  }
}

export function lowerCaseObjectArray(array){
  if (!array) return;

  for (let i = 0; i < array.length; i++)
  {
    let keys = Object.keys(array[i]);

    for (let k = 0; k < keys.length; k++) {
      let key = keys[k];
      if (typeof (array[i][key]) === 'string'){
        array[i][key] = array[i][key].toLowerCase();
      }
    }
  }
}

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0;
    let v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


export function allowDotsParse (obj) {
  let keys = Object.keys(obj);
  let target = {};
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];

    if (!key.includes('.')) {
      target[key] = obj[key];
    } else {
      let paths = key.split('.');

      let current = target;
      let last = null;
      let max = paths.length - 1;
      for (let j = 0; j < max; j++) {
        let path = paths[j];
        last = current[path];
        if (!last) {
          last = {};
        }

        current[path] = last;
        current = last;
      }

      let endPath = paths[paths.length - 1];
      last[endPath] = obj[key];
    }
  }

  return target;
}

export function allowDotsSerialize (obj) {
  if (!obj) return obj;

  let serialize = (v) => {
    let any = false;
    let current = v;
    do {
      any = false;

      let ks = Object.keys(current);
      let trg = {};

      for (let i = 0; i < ks.length; i++) {
        let key = ks[i];
        let val = current[key];

        if (val && typeof val === 'object' && !Array.isArray(val)) {
          let nstKeys = Object.keys(val);
          for (let j = 0; j < nstKeys.length; j++) {
            let nstKey = nstKeys[j];
            let nstVal = val[nstKey];

            let newKey = key + '.' + nstKey;
            trg[newKey] = nstVal;

            if (typeof nstVal === 'object' && !Array.isArray(val))
              any = true;
          }
        } else {
          trg[key] = val;
        }
      }

      current = trg;
    } while (any);

    return current;
  };

  let target = serialize(obj);
  return target;
}


export function hasValue(value) {
  if (value === null) return false;
  if (value === undefined) return false;
  if (value === '') return false;
  if (value === 0) return true;
  if (typeof value === 'object' && Array.isArray(value) && value.length <= 0) return false;

  if (value) return true;
  return false;
}

export function clearEmpty(obj) {
  if (!obj) return;

  let trg = {};
  let keys = Object.keys(obj);

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let val = obj[key];

    if (!hasValue(val)) continue;

    trg[key] = val;
  }

  return trg;
}

export function get(v, path, map, def) {
  if (v === null || v === undefined) return v;
  if (path && typeof path === 'string') path = path.split('.');

  if (path && path.length > 0) {
    let key = path[0];

    if (typeof v === 'object') {
      if (path.length > 1) {
        let relativePath = [...path];
        relativePath.splice(0,1);
        let val = get(v[key], relativePath);
        return map ? map(val) : val;
      }
      else if (v[key] !== null && v[key] !== undefined) {
        return map ? map(v[key]) : v[key];
      } else {
        return def !== undefined ? def : v[key];
      }

    }
  } else {
    return (v !== null && v !== undefined) ? map(v) : def !== undefined ? def : v;
  }

  return undefined;
}
