import organizationLevelsEnum from "../enums/organizationLevelsEnum.js"

export function toMoney(nStr, range = 2) {
  if (nStr !== 0 && !nStr) return;

  let type = typeof nStr;
  if (type === "string")
    nStr = nStr.replace(',', '.');

  nStr = parseFloat(nStr).toFixed(range);

  nStr += '';
  let x = nStr.split('.');
  let x1 = x[0];
  let x2 = x.length > 1 && x[1] !== '00' ? ',' + x[1] : '';
  const rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + '\u00A0' + '$2');
  }
  return x1 + x2;
}

/*
 * Привести к формату с плавающей запятой, например 19,2 или 1,50 или 0,731.
 * @param value Входное значение.
 * @return Отформатированная строка.
 */
export function toFloatString(value) {
  if (value == null) {
    return null;
  }

  if (value == parseInt(value)) {
    return toMoney(value, 0);
  }

  let valueYText = '';

  //3 знака после запятой если 0 целых - 0,154
  /*
  if(value < 1) {
    valueYText =  toMoney(value, 3);
  }
  */
  //2 знака после запятой если однозначное целое - 1,54
  if (value < 10) {
    valueYText = toMoney(value, 2);
  }
  //1 знак после запятой если десятичные - 15,4
  else if (value < 100) {
    valueYText = toMoney(value, 1);
  }
  else {
    valueYText = toMoney(value, 0);
  }

  valueYText = valueYText.replace(/(,[0-9]*[1-9])0+$|,0*$/, '$1');

  return valueYText;
}

export function dhms(t) {
  let cd = 24 * 60 * 60 * 1000;
  let ch = 60 * 60 * 1000;
  let cm = 60 * 1000;
  let cs = 1000;

  let d = Math.floor(t / cd);
  let h = Math.floor((t - d * cd) / ch);
  let m = Math.floor((t - d * cd - h * ch) / cm);
  let s = Math.round((t - d * cd - h * ch - m * cm) / cs);

  let pad = function (n) { return n < 10 ? '0' + n : n; };

  if (s === 60) {
    m++;
    s = 0;
  }
  if (m === 60) {
    h++;
    m = 0;
  }
  if (h === 24) {
    d++;
    h = 0;
  }

  if (d <= 0)
    return `${pad(h)}:${pad(m)}:${pad(s)}`;

  let wordDay = getCorrect(d, 'день', 'дня', 'дней');
  return `${d} ${wordDay} ${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function getCorrect(number, ending1, ending2, ending5) {
  if (!ending1) ending1 = '';
  if (!ending2) ending2 = '';
  if (!ending5) ending5 = '';

  if (!number) number = 0;

  if (number === 0)
    return ending5;

  number = number % 100;
  if (number >= 11 && number <= 19)
    return ending5;

  let i = number % 10;
  switch (i) {
  case 1:
    return ending1;
  case 2:
  case 3:
  case 4:
    return ending2;
  default:
    return ending5;
  }
}

export function to00(number) {
  number = parseInt(number, 10);
  if (number <= 9)
    return `0${number}`;

  if (number === 0)
    return `0${number}`;

  if (!number)
    return '';

  return number.toString();
}


export function getOrganizationLevelText(value) {
  switch (value) {
  case 2: return '223-ФЗ';
  case 3: return 'Коммерческие';
  case 4: return '44-ФЗ';
  case 5: return '615-ППРФ';
  case 6: return 'Закупки малого объема';
  }

  return null;
}

export function parseDate(str) {
  let ms = Date.parse(str);

  return !isNaN(ms) && new Date(ms) || null;
}

export function addTimeZone(date, tz) {
  let dt = date;

  if (!dt) return null;

  if (dt.includes('T')) {
    if (!dt.includes('Z') && !dt.includes('+')) {
      dt = dt + (tz || 'Z');
    }
  }

  return dt;
}

export function isNullFalse(val) {
  if (val == null) {
    return false;
  }
  return val;
}

export function convertOrganizationLevels(levels) {
  if (levels && levels.length > 0) {
    let result = [];

    levels.forEach(function (item) {
      switch (item) {
      case organizationLevelsEnum.Fz223:
        result.push('223-fz');
        break;
      case organizationLevelsEnum.Commercial:
        result.push('Commercial');
        break;
      case organizationLevelsEnum.Fz44:
        result.push('44-fz');
        break;
      case organizationLevelsEnum.Pprf615:
        result.push('615-pp');
        break;
      case organizationLevelsEnum.Small:
        result.push('Small');
        break;
      default:
        result.push(item);
      }
    });

    return result;
  }
  else {
    return levels;
  }
}

export function getArrayFromString(value, separator = ",") {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object' && Array.isArray(value)) return value;

  return value.split(separator);
}

export function getIntArrayFromString(value, separator = ",") {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object' && Array.isArray(value)) return value;

  let strings = value.split(separator);
  let result = [];

  strings.forEach(function (item) {
    result.push(item * 1);
  });

  return result;
}

export function stringFromArray(value, separator = ",") {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'object' && !Array.isArray(value)) return value;

  if (typeof value === 'object' && Array.isArray(value)) {
    value = value.map(a => {
      if (typeof a === 'object') return a.key;
      else return a;
    });
  }

  return value.join(separator);
}

export function parseKey(a) {
  if (a && a.key && a.key.includes('{')) {
    return JSON.parse(a.key);
  } else {
    return { key: a.key };
  }
}

export function tryParse(str) {
  if (str && str.includes('{')) {
    return JSON.parse(str).key;
  } else {
    return str;
  }
}

export function treeToString(vl) {
  if (!vl || vl.length <= 0) return null;
  let str = vl.map(a => `${parseKey(a).key}|${a.parents && a.parents.map(tryParse).join(';') || ''}`).join(',');
  return str;
}

export function stringTreeParce(vl) {
  if (!vl) return;
  let itms = vl.split(',').map(a => {
    let keyParents = a.split('|');
    let key = keyParents && keyParents.length > 0 && keyParents[0];
    let parents = keyParents && keyParents.length > 1 && keyParents[1] && keyParents[1].split(';') || null;

    return { key, parents };
  });

  return itms;
}

export function pad(val, len) {
  val = String(val);
  len = len || 2;
  while (val.length < len) {
    val = '0' + val;
  }
  return val;
}

export function dateFormat(date) {
  if (!(date instanceof Date)) {
    return null;
  }

  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = pad(date.getFullYear(), 4);

  return `${d}.${m}.${y}`;
}

export function currencyCodeToText(code) {
  if (code == 643) return "₽";
  else if (code == 36) return "AUD";
  else if (code == 986) return "BRL";
  else if (code == 933) return "BYN";
  else if (code == 124) return "CAD";
  else if (code == 756) return "CHF";
  else if (code == 156) return "CNY";
  else if (code == 978) return "EUR";
  else if (code == 826) return "GBP";
  else if (code == 348) return "HUF";
  else if (code == 356) return "INR";
  else if (code == 392) return "JPY";
  else if (code == 398) return "KZT";
  else if (code == 752) return "SEK";
  else if (code == 702) return "SGD";
  else if (code == 980) return "UAH";
  else if (code == 840) return "USD";
  else if (code == 860) return "UZS";
  else if (code == 710) return "ZAR";

  return null;
}


export function toBoolean(v, posibleNull = true) {
  if (v === true) return true;
  if (v === false) return false;
  if (v === 0) return false;
  if (v === 1) return true;

  if (posibleNull && v === null) return null;
  if (posibleNull && v === undefined) return null;

  if (v === null || v === undefined) return false;

  if (typeof v === 'string') {
    if (posibleNull && v === '') return null;

    let txt = v.toLowerCase();

    if (txt === 'true') return true;
    if (txt === 'false') return false;

    if (txt === '1') return true;
    if (txt === '0') return false;

    if (txt === 'да') return true;
    if (txt === 'нет') return false;

    if (txt === 'yes') return true;
    if (txt === 'no') return false;

    if (txt === 'y') return true;
    if (txt === 'n') return false;

    if (posibleNull && txt === 'null') return null;
    if (posibleNull && txt === 'undefined') return null;
  }

  return !!v;
}
