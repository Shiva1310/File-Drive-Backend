import { Request, Response } from "express";
import File from "../models/File";
import {
  generateUploadSignedUrl,
  generateDownloadSignedUrl,
  deleteFileFromS3,
} from "../services/s3Service";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getUploadUrl = async (req: AuthRequest, res: Response) => {
  const { fileName, contentType } = req.body;
  const { key, url } = await generateUploadSignedUrl(fileName, contentType);

  const file = new File({
    filename: fileName,
    contentType,
    key,
    userId: req.user.id,
  });
  await file.save();

  res.status(200).json({ uploadUrl: url, key });
};

export const listUserFiles = async (req: AuthRequest, res: Response) => {
  const files = await File.find({ userId: req.user.id }).lean();

  const withSignedUrls = await Promise.all(
    files.map(async (file) => ({
      ...file,
      signedUrl: await generateDownloadSignedUrl(file.key!),
    }))
  );

  res.json(withSignedUrls);
};

export const deleteFile = async (req: AuthRequest, res: Response) => {
  const { key } = req.params;
  const file = await File.findOneAndDelete({ key, userId: req.user.id });

  if (!file) return res.status(404).json({ msg: "File not found" });

  await deleteFileFromS3(key);
  res.json({ msg: "File deleted successfully" });
};
