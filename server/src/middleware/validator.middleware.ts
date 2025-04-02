import { logger } from "../lib/logger";
import { asyncHandler } from "../lib/asyncHandler";
import { ApiError, ErrCodes } from "../lib/ApiError";
import { body, query, validationResult } from "express-validator";


/**
 * TODO: Too much validators are still left
 */

const validator = asyncHandler((req, res, next) => {
  const errors = validationResult(req);

  logger.info("I am crossing validator Middleware.");

  if (errors.isEmpty()) {
    return next();
  }

  logger.error(`Validation errors: ${JSON.stringify(errors)}`);

  throw new ApiError(
    400,
    `${errors.array()[0].msg}`,
    ErrCodes.VALIDATION_ERR,
    errors.array()
  );
});

const authRouteValidators = {
  loginRoute: [
    body("password").notEmpty().withMessage("Password is required field."),

    body("email")
      .if((value, { req }) => !req.body.username)
      .notEmpty()
      .withMessage("Any one of email or username is required to login.")
      .isEmail()
      .withMessage("Invalid email format.")
      .trim()
      .toLowerCase(),

    body("username")
      .if((value, { req }) => !req.body.email)
      .notEmpty()
      .withMessage("Any one of email or username is required to login.")
      .isLength({ max: 20 })
      .withMessage("Username must be less than 20 chars.")
      .matches(/^[a-zA-Z0-9.-]+$/)
      .withMessage(
        "Username can only contain letters, numbers and can't user special chars other than dot(.) or dash(-) special chars. "
      )
      .trim()
      .toLowerCase(),
    validator,
  ],
  verifyEmailRoute: [
    query("verificationToken")
      .notEmpty()
      .withMessage("'verificationToken' is a required query parameter.")
      .trim(),
    validator,
  ],
  registerRoute: [
    body(["firstName", "lastName"])
      .notEmpty()
      .withMessage("firstName and lastName are required field."),

    body("password").notEmpty().withMessage("Password is required field."),

    body("email")
      .notEmpty()
      .withMessage("email is required to login.")
      .isEmail()
      .withMessage("Invalid email format.")
      .trim()
      .toLowerCase(),

    // body('username')
    //     .notEmpty()
    //     .withMessage('username is required to login.')
    //     .isLength({ max: 20 })
    //     .withMessage('Username must be less than 20 chars.')
    //     .matches(/^[a-zA-Z0-9.-]+$/)
    //     .withMessage('Username can only contain letters, numbers and can\'t user special chars other than dot(.) or dash(-) special chars. ')
    //     .trim()
    //     .toLowerCase(),
    validator,
  ],
  resendEmailRoute: [
    body("email")
      .notEmpty()
      .withMessage("email is required to login.")
      .isEmail()
      .withMessage("Invalid email format.")
      .trim()
      .toLowerCase(),
    validator,
  ],
  resetPasswordMailRoute: [
    body("email")
      .notEmpty()
      .withMessage("email is required to login.")
      .isEmail()
      .withMessage("Invalid email format.")
      .trim()
      .toLowerCase(),
    validator,
  ],
  resetPasswordRoute: [
    body("password").notEmpty().withMessage("Password is required field."),

    query("verificationToken")
      .notEmpty()
      .withMessage("Verification token not found.")
      .trim(),
    validator,
  ],
};

const userRouteValidators = {
  updateUserRoute: [
    body("firstName")
      .if((_, { req }) => !(req.body.lastName && req.body.username))
      .optional()
      .notEmpty(),

    body("lastName")
      .if((_, { req }) => !(req.body.firstName && req.body.username))
      .optional()
      .notEmpty(),

    body("username")
      .if((_, { req }) => !(req.body.firstName && req.body.username))
      .optional()
      .notEmpty()
      .withMessage("Atleast provide the username to update it.")
      .isLength({ max: 20 })
      .withMessage("Username must be less than 20 chars.")
      .matches(/^[a-zA-Z0-9.-]+$/)
      .withMessage(
        "Username can only contain letters, numbers and can't user special chars other than dot(.) or dash(-) special chars. "
      )
      .trim()
      .toLowerCase(),
    validator,
  ],
  verifyMobileOtpRoute: [
    body("otpWidgetVerificationToken")
      .notEmpty()
      .withMessage("Please provide otp widget verification token."),

    validator,
  ],
  applyForStreamerRoute: [
    body(["city", "state"]).notEmpty().trim().isLength({ min: 3 }),

    body("postalCode")
      .notEmpty()
      .trim()
      .matches(/^\d+$/)
      .withMessage("Postal code must only contain numbers."),

    // body("vpa")
    //   .if((_, { req }) => !(req.body.bankAccountNumber && req.body.bankIfsc))
    //   .notEmpty()
    //   .withMessage("bank account or upi is required to login.")
    //   .matches(/^[0-9A-Za-z.-]{2,256}@[A-Za-z]{2,64}$/)
    //   .withMessage("Invalid upi id.")
    //   .trim()
    //   .toLowerCase(),

    body("bankAccountNumber")
      .notEmpty()
      .withMessage("bank account or upi is required to login.")
      .trim()
      .matches(/^\d+$/)
      .isLength({ max: 18, min: 9 })
      .withMessage("Invalid bank account number."),

    body("bankIfsc")
      .notEmpty()
      .withMessage(
        "Any one of upi or bank details is required to apply for streamer."
      )
      .matches(/^[A-Za-z]{4}\d{7}$/)
      .withMessage("Invalid IFSC Code")
      .trim()
      .toLowerCase(),

    body("phoneNumber").notEmpty().isLength({ min: 10, max: 20 }),

    // body("countryCode")
    //   .notEmpty()
    //   .withMessage("please provide your country code.")
    //   .matches(/^\+.[0-9]$/)
    //   .withMessage("invalid contry code."),

    body("streetAddress")
      .notEmpty()
      .isLength({ min: 3, max: 90 })
      .withMessage("streetAddress must between 3-90 characters.")
      .trim(),

    body("youtubeChannelName")
      .notEmpty()
      .isLength({ min: 3, max: 90 })
      .withMessage("channel name must between 3-90 characters.")
      .trim(),

    validator,
  ],
};

const streamRouteValidators = {
  createStreamRoute: [
    body("title")
      .notEmpty()
      .withMessage("Title is required field.")
      .isLength({ min: 3, max: 190 })
      .withMessage("Title must be within 3-60 characters.")
      .trim(),
    validator,
  ],
};

export { authRouteValidators, userRouteValidators, streamRouteValidators };
