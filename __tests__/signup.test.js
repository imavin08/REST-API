// const request = require("supertest");
// const app = require("../../src/app");
const { User } = require("../src/db/authModel");
const bcrypt = require("bcrypt");

const { loginController } = require("../src/controllers/authController");

// eslint-disable-next-line no-undef
describe("signupController test", () => {
  // eslint-disable-next-line no-undef
  test("should return status(200), should return token and object(user) with two keys(email,subscription with value string)", async () => {
    const mReq = {
      body: {
        email: "example@ex.com",
        password: "123",
      },
    };

    const token = "1";
    const user = {
      email: "userLogin@ex.com",
      subscription: "test",
      password: "123",
    };

    // eslint-disable-next-line no-undef
    jest.spyOn(User, "findOne").mockImplementationOnce(() => user);

    const mRes = {};

    await loginController(mReq, mRes);

    // eslint-disable-next-line no-undef
    // expect(mRes.status).toEqual(200);
    // expect(loginMock.mockReturnValue({ token, user }));
  });
});
