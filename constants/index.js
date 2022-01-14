const SUCCESS = "success";
const ERROR = "error";

module.exports = {
  SUCCESS,
  ERROR,
  UNEXPECTED_ERROR: {
    status: false,
    alert: { type: ERROR, msg: "Sorry, Something happened unexpectedly" },
  },
};
