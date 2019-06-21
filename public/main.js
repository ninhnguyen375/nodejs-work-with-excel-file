const removeAllData = async () => {
  const res = await axios.post(`/sv/removeAll`);
  getAll();
};

const clearContent = container => {
  document.getElementById(container).innerHTML = '';
};

const renderTable = data => {
  const table = document.getElementsByTagName('table')[0];
  let stringCode = `<tr>
                          <td>MSSV</td>
                          <td>Ten SV</td>
                          <td>Diem</td>
                          <td>Thao tac</td>
                        </tr>`;
  data.forEach(item => {
    stringCode += `
                        <tr>
                          <td>${item.MSSV}</td>
                          <td>${item.TenSV}</td>
                          <td>${item.Diem}</td>
                          <td>
                            <button onclick="deleteSV('${
                              item.MSSV
                            }')">Xoa</button>
                          </td>
                        </tr>`;
  });
  table.innerHTML = stringCode;
};

const renderErrors = errors => {
  let stringCode = '';
  const container = document.getElementById('errors');
  if (errors.length === 0) container.innerHTML = 'none error';
  else {
    errors.forEach(err => {
      stringCode += `<div>${err}</div>`;
    });
    container.innerHTML = stringCode;
  }
};
const renderInserted = inserted => {
  let stringCode = '';
  const container = document.getElementById('inserted');
  if (inserted.length === 0) container.innerHTML = 'none inserted';
  else {
    inserted.forEach(item => {
      stringCode += `<div>${item.MSSV}</div>`;
    });
    container.innerHTML = stringCode;
  }
};

const deleteSV = async mssv => {
  try {
    const res = await axios.delete(`/sv/${mssv}`);
    getAll();
  } catch (error) {
    console.log(error, mssv);
  }
};

const getAll = async () => {
  const res = await axios.get('/sv');

  renderTable(res.data);
};

const sendFile = async () => {
  const file = document.getElementById('file').files[0];
  const form = new FormData();

  form.append('sv_file', file);

  const option = {
    headers: {
      'content-type': file.type,
    },
  };
  const res = await axios.post('/sv/excel', form, option);

  renderErrors(res.data.errors);
  renderInserted(res.data.inserted);
  getAll();
};
window.onload = getAll;
