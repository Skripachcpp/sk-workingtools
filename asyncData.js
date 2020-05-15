export function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0;
    let v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function create({ loading, data, dataIsEmpty, error, fetchId } = {}) {
  return {
    loading: loading === undefined ? false : loading,
    data: data === undefined ? {} : data,
    dataIsEmpty: dataIsEmpty === undefined ? null : dataIsEmpty,
    error: error === undefined ? null : error,
    fetchId: fetchId === undefined ? null : fetchId,
  };
}

export function reset(data) {
  data.fetchId = null;
  data.loading = false;
  data.data = {};
  data.dataIsEmpty = null;
  data.error = null;
}

export async function ensure(data, fetcher) {
  if (data.loading || data.data) {
    return;
  }

  await fetch(data, fetcher);
}

export async function fetch(data, fetcher) {
  const fetchId = uuidv4();

  data.loading = true;
  data.data = null;
  data.dataIsEmpty = null;
  data.error = null;
  data.fetchId = fetchId;

  while (true) {
    try {
      const newData = await fetcher();

      if (data.fetchId != fetchId) {
        return;
      }

      let compleat = !newData || !newData.timeToRefresh;
      // возможно что бэк вернул только часть данных
      // в таком случае нужно отрисовать их
      // и повторить запрос позже
      update(data, newData, null, !compleat);
      if (compleat) {
        data.fetchId = null;
        return;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, newData.timeToRefresh * 1000)
      );

      if (data.fetchId != fetchId) {
        return;
      }
    } catch (e) {
      if (data.fetchId == fetchId) {
        update(data, null, e);
      }
      return;
    }
  }
}

function update(data, newData, error, loading) {
  data.loading = loading;
  data.error = error;
  data.data = (!error && newData) || {};
  data.dataIsEmpty = !newData;

  if (newData) {
    let dataIsEmpty = true;
    for (let k in newData) {
      let a = newData[k];
      if (a) {
        if (typeof a === "object" && Array.isArray(a)) {
          if (a.length > 0) {
            dataIsEmpty = false;
            break;
          }
        } else {
          dataIsEmpty = false;
          break;
        }
      }
    }

    data.dataIsEmpty = dataIsEmpty;
  }

  return true;
}
