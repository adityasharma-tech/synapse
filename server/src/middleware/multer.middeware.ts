import multer from "multer";

const storage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, "./public/temp");
  },
  filename: function (_, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });
