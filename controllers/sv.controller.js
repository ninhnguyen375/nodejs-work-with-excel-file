const db = require('../db');
const path = require('path');
const xlsx = require('xlsx');

const svSchema = {
  MSSV: null,
  TenSV: null,
  Diem: null,
};

const compareKeys = (a, b) => {
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  return JSON.stringify(aKeys) === JSON.stringify(bKeys);
};

const isExist = async ({ collectionName, key, value }) => {
  const data = await db
    .get(collectionName)
    .find({ [key]: value })
    .value();
  if (!data) return false;
  return true;
};

const isObjEmpty = obj => {
  const length = Object.values(obj).length;
  return length === 0;
};

module.exports.getAllSV = ({ res }) => {
  res.json(db.get('sv').value());
};

module.exports.removeSV = async (req, res) => {
  const { MSSV } = req.params;
  const isExistSV = await isExist({
    collectionName: 'sv',
    key: 'MSSV',
    value: MSSV,
  });

  if (isExistSV) {
    await db
      .get('sv')
      .remove({ MSSV: MSSV })
      .write();

    res.send('success');
  } else {
    res.send({ isExistSV, mess: `not found ${MSSV}` });
  }
};

module.exports.insertSV = async (req, res) => {
  const sv = req.body;

  if (isObjEmpty(sv)) {
    return res.status(400).send('null data');
  }

  const isExistSV = await isExist({
    collectionName: 'sv',
    key: 'MSSV',
    value: MSSV,
  });

  if (isExistSV) {
    res.status(400).send(`${sv.MSSV} already exist`);
  } else {
    await db
      .get('sv')
      .push(sv)
      .write();
    res.send('success');
  }
};

module.exports.insertFromExcel = async (req, res) => {
  let inserted = [];
  let errors = [];
  let promises = [];

  // get workbook
  const workbook = xlsx.read(req.files.sv_file.data);

  // get sheet name from workbook
  const first_sheet_name = workbook.SheetNames[0];

  // Get worksheet
  const worksheet = workbook.Sheets[first_sheet_name];

  // convert worksheet to json
  const jsonOfWorksheet = xlsx.utils.sheet_to_json(worksheet);
  const insert = async item => {
    const isExistItem = await isExist({
      collectionName: 'sv',
      key: 'MSSV',
      value: item.MSSV,
    });

    if (isExistItem) {
      errors.push(`${item.MSSV} already exist`);
    } else if (!compareKeys(svSchema, item)) {
      errors.push(`${item.MSSV} has missing some value`);
    } else {
      await db
        .get('sv')
        .push(item)
        .write();
      inserted.push(item);
    }
  };

  // insert to db
  for (let i = 0; i < jsonOfWorksheet.length; i++) {
    const item = jsonOfWorksheet[i];
    promises.push(insert(item));
  }
  await Promise.all(promises);

  res.json({ inserted, errors });
};

module.exports.removeAll = async (req, res) => {
  await db
    .get('sv')
    .remove({})
    .write();
  res.send('success');
};

module.exports.downloadCSV = async (req, res) => {
  const sv = await db.get('sv').value();
  worksheet = xlsx.utils.json_to_sheet(sv);
  // create workbook
  const wb = xlsx.utils.book_new();
  // add worksheet to workbook
  xlsx.utils.book_append_sheet(wb, worksheet, 'sheet1');
  // export file to .xlsx
  // await wb.xlsx.write('/public/excel-files/sv_newest.xlsx');
  xlsx.writeFile(wb, 'sv_newest.xlsx', {});
  res.download('sv_newest.xlsx');
};
