import db from "../../config/db.js";

export const getRole = async (userId, projectId) => {
    const [relationRows] = await db.query(
      "SELECT * FROM ProjectUsers WHERE project_id = ? AND user_id = ?",
      [projectId, userId]
    );
    if (relationRows.length > 0) {
      return relationRows[0].role;
    }
    else{
      return null;
    }
};


export const getRoleForFolder = async (userId, folderId) => {
  const [folderRow] = await db.query(
    "SELECT projectId FROM Folders WHERE id = ?",
    [folderId]
  );
  const [relationRows] = await db.query(
    "SELECT * FROM ProjectUsers WHERE project_id = ? AND user_id = ?",
    [folderRow[0].projectId, userId]
  );
  if (relationRows.length > 0) {
    return relationRows[0].role;
  }
  else{
    return null;
  }
};