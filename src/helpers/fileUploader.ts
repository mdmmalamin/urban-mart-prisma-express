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
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(process.cwd(), "/uploads"));
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// const uploadToCloudinary = async (
//   file: TFile,
//   fileName: string,
//   folder: string
// ): Promise<TCloudinaryResponse | any> => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload(
//       file.path,
//       {
//         public_id: fileName,
//         folder: `urban-mart/${folder}`,
//       },

//       (
//         error: UploadApiErrorResponse | undefined,
//         result: UploadApiResponse | undefined
//       ) => {
//         fs.unlinkSync(file.path);
//         if (error) {
//           reject(error);
//         } else {
//           resolve(result);
//         }
//       }
//     );
//   });
// };

const uploadToCloudinary = async (
  fileBuffer: any,
  fileName: string,
  folder: string
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { public_id: fileName, folder: folder },
      (error, result) => {
        if (error) {
          console.error("Error uploading to Cloudinary:", error);
          return reject(error);
        }
        resolve(result);
      }
    );

    // Send the buffer to Cloudinary via stream
    uploadStream.end(fileBuffer.buffer);
  });
};

//? Multer storage: store the file in memory
//! for memoryStorage()
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
//! for memoryStorage()

//? Function to duplicate an image
const duplicateToCloudinary = async (
  //! This is beta version
  originalFileName: string,
  newFileName: string
): Promise<TCloudinaryResponse | any> => {
  try {
    console.log("originalFileName: ", originalFileName);
    console.log("newFileName: ", newFileName);
    const result = await cloudinary.uploader.explicit(originalFileName, {
      type: "upload",
      public_id: newFileName,
      overwrite: false, //? Ensures the original is not overwritten
    });

    console.log("Image duplicated successfully:", result);
    return await result;
  } catch (error) {
    console.error("Error duplicating image:", error);
  }
};

const imageName = (name: string) => {
  return name.split(" ").join("_") + "_" + Date.now();
};

const extractPublicId = async (url: string) => {
  const regex = /image\/upload\/(?:v\d+\/)?(urban-mart\/product\/.+?)(?=\.\w+)/; //? Match everything after "image/upload/" starting with "urban-mart/product/"
  const match = url.match(regex);
  return (await match) ? match?.[1] : null; //? Return the matched path or null if not found
};

export const fileUploader = {
  upload,
  uploadToCloudinary,
  duplicateToCloudinary,

  imageName,
  extractPublicId,
};
