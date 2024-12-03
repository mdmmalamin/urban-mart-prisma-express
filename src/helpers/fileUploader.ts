import multer from "multer";
import path from "path";
import fs from "fs";

import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";
import { TCloudinaryResponse, TFile } from "../app/interfaces";
import config from "../config";

//? Configuration
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

//? Temporary store into server
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const uploadToCloudinary = async (
  file: TFile,
  fileName: string,
  folder: string
): Promise<TCloudinaryResponse | any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.path,
      {
        public_id: fileName,
        folder: `healthcare-ms/${folder}`,
      },

      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        fs.unlinkSync(file.path);
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

export const fileUploader = {
  upload,
  uploadToCloudinary,
};
