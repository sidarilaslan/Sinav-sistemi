const { connectDB } = require("../loaders/db");

async function getUsers() {
  let x = await connectDB();
  return await x.query("SELECT * FROM tblUsers").then((result) => {
    result.recordset.forEach((question) => {
      if (question.image != null)
        question.image = `data:${
          question.imageMimeType
        };base64,${question.image.toString("base64")}`;
    });
    return result.recordset;
  });
}

async function getUser(key, value) {
  let x = await connectDB();
  return await x
    .query(`SELECT * FROM tblUsers where ${key}='${value}'`)
    .then((result) => {
      if (result.recordset[0].image != null)
        result.recordset[0].image = `data:${
          result.recordset[0].imageMimeType
        };base64,${result.recordset[0].image.toString("base64")}`;
      return result.recordset[0];
    });
}
async function searchUser(mail, password) {
  let x = await connectDB();
  return (
    await x.query(
      `SELECT * FROM tblUsers WHERE mail = '${mail}' AND password = '${password}'`
    )
  ).recordset;
}
async function insertUser(user, image) {
  return await connectDB().then(async (db) => {
    let isThereUploadedImg = image != undefined;
    return await (isThereUploadedImg
      ? db.input("img", Buffer.from(image.data, "binary"))
      : db
    )
      .query(
        `Insert into tblUsers OUTPUT Inserted.userID values('${user.name}','${user.surName}', '${user.mail}','${user.password}',${user.userTypeID},'${user.tcNO}',` +
          (isThereUploadedImg ? `'${image?.mimetype}',@img)` : "NULL,NULL)")
      )
      .then((result) => {
        return { userId: result.recordset[0].userID };
      });
  });
}
async function updateUser(user, image) {
  return await connectDB().then(async (db) => {
    let isThereUploadedImg = image != undefined;
    return await (isThereUploadedImg
      ? db.input("img", Buffer.from(image.data, "binary"))
      : db
    ).query(
      `Update tblUsers set name='${user.name}', surname='${user.surName}', mail='${user.mail}', password='${user.password}', userTypeID=${user.userTypeID}, tcNO='${user.tcNO}'` +
        (isThereUploadedImg
          ? `, imageMimeType='${image?.mimetype}', image=@img `
          : " ") +
        `where userID=${user.userID}`
    );
  });
}
async function updatePassword(mail, password) {
  let x = await connectDB();
  return (
    await x.query(
      `Update tblUsers set password='${password}' where mail='${mail}'`
    )
  ).recordset;
}
async function deleteUser(userID) {
  let x = await connectDB();
  return (await x.query(`Delete from tblUsers where userID = ${userID}`))
    .recordset;
}

module.exports = {
  getUsers,
  getUser,
  searchUser,
  insertUser,
  updateUser,
  deleteUser,
  updatePassword,
};
