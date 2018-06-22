const toCamelCase = str =>
  str.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
    (index === 0 ? letter.toLowerCase() : letter.toUpperCase())
  ).replace(/\s+/g, '');

const simpleFieldMapper = (row) => {
  const mapped = {};
  Object.keys(row).forEach((field) => {
    // remove the table prefix
    const shortField = field.substring(field.indexOf('_') + 1);
    //
    mapped[shortField] = row[field].value;
  });
  return mapped;
};

const simpleFormMapper = (dataObj) => {
  const mapped = [];
  
  Object.keys(dataObj).forEach((field) => {
    if(field != 'gridData') {
      let newobj = {key: field, value: dataObj[field].value};
    }
    mapped.push(newobj);
  });
  return mapped;
};

const titleMapper = (row, columns) => {
  const mapped = {};
  Object.keys(row).forEach((field) => {
    mapped[toCamelCase(columns[field])] = row[field];
  });
  return mapped;
};

// const parseDataType = (field) => {
//   switch (field.dataType) {
//     case 9: return parseFloat(field.value);
//     case 11: return moment(field.value, dateFormat).toDate();
//     default: return field.value;
//   }
// };


export {
  toCamelCase,
  simpleFieldMapper,
  titleMapper,
  // parseDataType,
};
